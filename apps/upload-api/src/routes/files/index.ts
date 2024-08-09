import {
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { Type } from "@sinclair/typebox";
import { FastifyInstance, FastifyRequest } from "fastify";
import { EventEmitter } from "node:events";
import { PassThrough, pipeline } from "stream";
import { HttpError } from "../../types/httpErrors.js";
import {
  getGenericResponseSchema,
  ResponseMetadata,
} from "../../types/schemaDefinitions.js";
import PromiseTransform from "./PromiseTransform.js";

import {
  BadRequestError,
  CustomError,
  getErrorMessage,
  NotFoundError,
  ServerError,
} from "shared-errors";
import deleteFileMetadata from "./utils/deleteFileMetadata.js";
import getFileMetadata from "./utils/getFileMetadata.js";
import getUserFiles from "./utils/getUserFiles.js";
import insertFileMetadata from "./utils/insertFileMetadata.js";
import updateFileMetadata from "./utils/updateFileMetadata.js";
import getDbVersion from "./utils/getDbVersion.js";
import { Stream } from "node:stream";

const FILE_UPLOAD = "FILE_UPLOAD";
const FILE_DELETE = "FILE_DELETE";
const FILE_DOWNLOAD = "FILE_DOWNLOAD";

const permissions = {
  citizen: {
    test: "upload:file.self:read",
    testError: "fake_permission",
  },
  publicServant: {
    test: "payments:create:object",
    testError: "fake_permission",
  },
};

const deleteObject = (
  s3Client: S3Client,
  bucketName: string,
  filename: string,
) => {
  return s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: filename,
    }),
  );
};

const scanAndUpload = async (app: FastifyInstance, request: FastifyRequest) => {
  const data = await request.file();
  const userId = request.userData?.userId as string;

  if (!data) {
    throw new BadRequestError(FILE_UPLOAD, "Request is not multipart");
  }

  const stream = data.file;
  const fileMimeType = data.mimetype;

  const filename = data.filename;

  if (!filename) {
    throw new BadRequestError(FILE_UPLOAD, "Filename is not provided");
  }

  const eventEmitter = new EventEmitter();

  const s3Config = app.s3Client;

  stream.on("limit", () => {
    if (data.file.truncated) {
      eventEmitter.emit("fileTooLarge");
    }
  });

  let length = 0;
  stream.on("data", (chunk) => {
    length += chunk.length;
  });

  const antivirusPassthrough = app.avClient.passthrough();

  const antiVirusPromise = new Promise<void>((resolve, reject) => {
    antivirusPassthrough.once("error", (err) => {
      return reject(
        new CustomError(
          FILE_UPLOAD,
          "Internal server error",
          500,
          "ANTIVIRUS_SCAN_ERROR",
          err,
        ),
      );
    });

    antivirusPassthrough.once("scan-complete", async (result) => {
      const { isInfected } = result;
      console.log({ result });

      if (isInfected) {
        // await insertFileMetadata(app, {
        //   createdAt: new Date(),
        //   lastScan: new Date(),
        //   fileSize: length,
        //   infected: true,
        //   infectionDescription: viruses.join(","),
        //   key: `${userId}/${filename}`,
        //   mimetype: fileMimeType,
        //   owner: userId as string,
        //   filename,
        // });
        return reject(new CustomError(FILE_UPLOAD, "File is infected", 400));
      }
      console.log("done");

      resolve();
    });
  });

  const promisePassthrough = new PromiseTransform(antiVirusPromise);
  const s3uploadPassthrough = new PassThrough();

  const upload = new Upload({
    client: s3Config.client,
    queueSize: 4, // optional concurrency configuration
    leavePartsOnError: false, // optional manually handle dropped parts
    params: {
      Bucket: s3Config.bucketName,
      Key: `${userId}/${filename}`,
      Body: s3uploadPassthrough,
    },
  });

  upload
    .done()
    .then(async (resData) => {
      const { Key } = resData;
      try {
        const antivirusDbVersion = await getDbVersion(app.avClient);
        await insertFileMetadata(app, {
          createdAt: new Date(),
          lastScan: new Date(),
          fileSize: length,
          infected: false,
          key: Key as string,
          mimetype: fileMimeType,
          owner: userId as string,
          filename,
          antivirusDbVersion: antivirusDbVersion,
        });
      } catch (err) {
        app.log.error(err);
        eventEmitter.emit(
          "error",
          new ServerError(FILE_UPLOAD, "Internal server error"),
        );
      }
    })
    .catch((err) => {
      eventEmitter.emit("error", err);
    })
    .then(() => {
      eventEmitter.emit("fileUploaded");
    });

  pipeline(
    stream,
    antivirusPassthrough,
    promisePassthrough,
    s3uploadPassthrough,
    (err) => {
      if (err) {
        eventEmitter.emit("error", err);
      }
    },
  );

  return new Promise<void>((resolve, reject) => {
    eventEmitter.once("fileUploaded", () => {
      resolve();
    });

    eventEmitter.once("fileTooLarge", () => {
      reject(new BadRequestError(FILE_UPLOAD, "File is too large"));
    });

    eventEmitter.once("error", (err) => {
      if (err.errorCode === 500) {
        reject(new ServerError(FILE_UPLOAD, "Server error"));
      } else {
        reject(new BadRequestError("badRequest", getErrorMessage(err), err));
      }
    });

    eventEmitter.on("error", () => {
      //noop to prevent unhandled promise rejection and double error logging
    });
  });
};

export default async function routes(app: FastifyInstance) {
  app.addHook("preValidation", async (request, reply) => {
    await app.checkPermissions(request, reply, [permissions.citizen.test]);
  });

  app.post(
    "/",
    {
      schema: {
        consumes: ["multipart/form-data"],
        tags: ["Files"],
        response: {
          200: getGenericResponseSchema(
            Type.Object({ message: Type.String() }),
          ),
          "4xx": HttpError,
          "5xx": HttpError,
        },
      },
    },
    async (request, reply) => {
      await scanAndUpload(app, request);

      reply.send({ data: { message: "File uploaded successfully" } });
    },
  );

  app.get(
    "/",
    {
      schema: {
        tags: ["Files"],
        response: {
          200: getGenericResponseSchema(Type.Array(ResponseMetadata)),
          "4xx": HttpError,
          "5xx": HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.userData?.userId as string;
      const data = await getUserFiles(app, userId);
      const files = data.rows;
      reply.send({ data: files });
    },
  );

  app.delete<{ Params: { key: string } }>(
    "/:key",
    {
      schema: {
        tags: ["Files"],
        params: Type.Object({ key: Type.String() }),
        response: {
          200: getGenericResponseSchema(
            Type.Object({ message: Type.String() }),
          ),
          "4xx": HttpError,
          "5xx": HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.userData?.userId as string;

      if (!request.params.key) {
        throw new BadRequestError(FILE_DELETE, "File key not provided");
      }

      const fileData = await getFileMetadata(app, request.params.key, userId);

      const file = fileData.rows?.[0];

      if (!file) {
        throw new NotFoundError(FILE_DELETE);
      }

      try {
        await app.s3Client.client.send(
          new DeleteObjectCommand({
            Bucket: app.s3Client.bucketName,
            Key: file.key,
          }),
        );

        await deleteFileMetadata(app, request.params.key);
      } catch (err) {
        throw new ServerError(FILE_DELETE, "Internal server error", err);
      }

      reply.send({ data: { message: "File deleted succesfully" } });
    },
  );

  app.get<{ Params: { key: string } }>(
    "/:key",
    {
      schema: {
        tags: ["Files"],
        params: Type.Object({ key: Type.String() }),
        response: {
          200: Type.String(),
          "4xx": HttpError,
          "5xx": HttpError,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      let response;

      const userId = request.userData?.userId as string;

      const key = request.params.key;
      const fileData = await getFileMetadata(app, key, userId);

      const file = fileData.rows.length > 0 ? fileData.rows[0] : undefined;

      if (!file) {
        throw new NotFoundError(FILE_DOWNLOAD, "File not found");
      }

      try {
        response = await app.s3Client.client.send(
          new GetObjectCommand({
            Bucket: app.s3Client.bucketName,
            Key: `${file.key}`,
          }),
        );
      } catch (err) {
        const err_ = err as { $metadata: { httpStatusCode: number } };
        if (err_.$metadata.httpStatusCode === 404) {
          throw new NotFoundError(FILE_DOWNLOAD, "File not found");
        } else {
          throw new ServerError(FILE_DOWNLOAD, "Internal server error", err);
        }
      }

      const body = response.Body;
      if (!body) {
        throw new ServerError(FILE_DOWNLOAD, "Body not found");
      }
      const stream = body.transformToWebStream();

      const pipelinedStreams = [stream];

      const antivirusDbVersion = await getDbVersion(app.avClient);

      if (file.antivirusDbVersion !== antivirusDbVersion) {
        const antivirusPassthrough = app.avClient.passthrough();

        const thePromise = new Promise<void>((resolve, reject) => {
          antivirusPassthrough.once("error", (err) => {
            app.log.error(err);
            // Rejecting here can cause html 5 video to throw ERR_STREAM_PREMATURE_CLOSE

            // return reject(
            //   new CustomError(
            //     FILE_DOWNLOAD,
            //     "Internal server error",
            //     500,
            //     "ANTIVIRUS_SCAN_ERROR",
            //     err,
            //   ),
            // );
          });
          antivirusPassthrough.once("scan-complete", async (result) => {
            const { isInfected, viruses } = result;

            if (isInfected) {
              const s3Config = app.s3Client;
              let fileDeleted = false;
              try {
                await deleteObject(
                  s3Config.client,
                  s3Config.bucketName,
                  file.key,
                );
                fileDeleted = true;
              } catch (error) {
                app.log.error(error);
              }
              try {
                await updateFileMetadata(app, {
                  ...file,
                  lastScan: new Date(),
                  infected: true,
                  deleted: fileDeleted,
                  infectionDescription: viruses.join(","),
                  antivirusDbVersion,
                });
              } catch (error) {
                app.log.error(error);
              }

              return reject(
                new CustomError(FILE_DOWNLOAD, "File is infected", 400),
              );
            }
            resolve();
          });
        });

        const monitorPassThrough = new PromiseTransform(thePromise);

        pipelinedStreams.push(
          antivirusPassthrough as unknown as ReadableStream,
          monitorPassThrough as unknown as ReadableStream,
        );
      }

      const downloadPassthrough = new PassThrough();
      pipelinedStreams.push(downloadPassthrough as unknown as ReadableStream);
      //TODO: check for a better solution
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pipeline(pipelinedStreams as any, (err) => {
        if (err) {
          app.log.error(err);
        }
      });

      reply.header("Content-Disposition", `filename="${file.filename}"`);
      reply.header("Content-type", file.mimetype);
      reply.header("Content-Length", file.fileSize);

      return reply.send(downloadPassthrough);
    },
  );
}
