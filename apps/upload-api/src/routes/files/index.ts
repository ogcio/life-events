import { Type } from "@sinclair/typebox";
import { FastifyInstance, FastifyRequest } from "fastify";
import { HttpError } from "../../types/httpErrors.js";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { PassThrough } from "stream";
import { EventEmitter } from "node:events";
import { pipeline } from "stream";
import { Upload } from "@aws-sdk/lib-storage";
import {
  getGenericResponseSchema,
  Object,
} from "../../types/schemaDefinitions.js";
import PromiseTransform from "./PromiseTransform.js";

import {
  BadRequestError,
  CustomError,
  getErrorMessage,
  NotFoundError,
  ServerError,
} from "shared-errors";
import insertFileMetadata from "./utils/insertFileMetadata.js";

const FILE_UPLOAD = "FILE_UPLOAD";
const FILE_INDEX = "FILE_INDEX";
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

// const deleteObject = (
//   s3Client: S3Client,
//   bucketName: string,
//   filename: string,
// ) => {
//   return s3Client.send(
//     new DeleteObjectCommand({
//       Bucket: bucketName,
//       Key: filename,
//     }),
//   );
// };

/**
 * @deprecated This method is used as a reference
 * @param
 * @param scanAndUpload
 * @returns
 */
// const scanAndUpload_ = async (
//   app: FastifyInstance,
//   request: FastifyRequest,
// ) => {
//   const data = await request.file();

//   if (!data) {
//     throw new BadRequestError(FILE_UPLOAD, "Request is not multipart");
//   }

//   const stream = data.file;
//   const filename = data.filename;

//   if (!filename) {
//     throw new BadRequestError(FILE_UPLOAD, "Filename is not provided");
//   }

//   const eventEmitter = new EventEmitter();

//   const promise = new Promise<void>((resolve, reject) => {
//     eventEmitter.once("infectedFileDetected", () => {
//       reject(new CustomError(FILE_UPLOAD, "File is infected", 400));
//     });

//     eventEmitter.once("fileUploaded", () => {
//       resolve();
//     });

//     eventEmitter.once("fileTooLarge", () => {
//       reject(new BadRequestError(FILE_UPLOAD, "File is too large"));
//     });

//     eventEmitter.once("error", (err) => {
//       reject(new BadRequestError("badRequest", getErrorMessage(err), err));
//     });

//     eventEmitter.on("error", () => {
//       //noop to prevent unhandled promise rejection and double error logging
//     });
//   });

//   const s3Config = app.s3Client;
//   let scanComplete = false;
//   let outputFinished = false;
//   let fileInfected = false;
//   const checkCompletion = () => {
//     if (!scanComplete || !outputFinished) {
//       return;
//     }

//     if (data.file.truncated) {
//       deleteObject(s3Config.client, s3Config.bucketName, filename)
//         .then(() => eventEmitter.emit("fileTooLarge"))
//         .catch((err) => {
//           eventEmitter.emit("error", err);
//         });
//     } else if (fileInfected) {
//       deleteObject(s3Config.client, s3Config.bucketName, filename)
//         .then(() => eventEmitter.emit("infectedFileDetected"))
//         .catch((err) => {
//           eventEmitter.emit("error", err);
//         });
//     } else {
//       eventEmitter.emit("fileUploaded");
//     }
//   };

//   stream.on("limit", () => {
//     if (data.file.truncated) {
//       eventEmitter.emit("fileTooLarge");
//     }
//   });

//   const antivirusPassthrough = app.avClient.passthrough();

//   antivirusPassthrough.once("error", (err) => {
//     eventEmitter.emit("error", err);
//   });

//   antivirusPassthrough.once("scan-complete", (result) => {
//     const { isInfected } = result;
//     if (isInfected) {
//       fileInfected = true;
//     }
//     scanComplete = true;
//     checkCompletion();
//   });

//   const s3uploadPassthrough = new PassThrough();

//   const upload = new Upload({
//     client: s3Config.client,
//     queueSize: 4, // optional concurrency configuration
//     leavePartsOnError: false, // optional manually handle dropped parts
//     params: {
//       Bucket: s3Config.bucketName,
//       Key: filename,
//       Body: s3uploadPassthrough,
//     },
//   });

//   upload
//     .done()
//     .then(() => {
//       outputFinished = true;

//       checkCompletion();
//     })
//     .catch((err) => {
//       eventEmitter.emit("error", err);
//       return;
//     });

//   pipeline(stream, antivirusPassthrough, s3uploadPassthrough, (err) => {
//     if (err) {
//       eventEmitter.emit("error", err);
//     }
//   });

//   return promise;
// };

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
      const { isInfected, viruses } = result;

      if (isInfected) {
        await insertFileMetadata(app, FILE_UPLOAD, {
          createdAt: new Date(),
          lastScan: new Date(),
          fileSize: length,
          infected: true,
          infectionDescription: viruses.join(","),
          key: `${userId}/${filename}`,
          mimetype: fileMimeType,
          owner: userId as string,
        });

        return reject(new CustomError(FILE_UPLOAD, "File is infected", 400));
      }

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
        await insertFileMetadata(app, FILE_UPLOAD, {
          createdAt: new Date(),
          lastScan: new Date(),
          fileSize: length,
          infected: false,
          infectionDescription: null,
          key: Key as string,
          mimetype: fileMimeType,
          owner: userId as string,
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
          200: getGenericResponseSchema(Type.Array(Object)),
          "4xx": HttpError,
          "5xx": HttpError,
        },
      },
    },
    async (request, reply) => {
      let response = null;
      try {
        const data = await app.s3Client.client.send(
          new ListObjectsV2Command({ Bucket: app.s3Client.bucketName }),
        );
        response =
          data.Contents?.map((item) => ({
            url: `${app.config.HOST}/api/v1/files/${item.Key?.slice(item.Key.lastIndexOf("/") + 1)}`,
            key: item.Key?.slice(item.Key.lastIndexOf("/") + 1),
            size: item.Size,
          })) || [];
      } catch (err) {
        throw new ServerError(FILE_INDEX, "Internal server error", err);
      }

      reply.send({ data: response });
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
      try {
        await app.s3Client.client.send(
          new DeleteObjectCommand({
            Bucket: app.s3Client.bucketName,
            Key: `${userId}/${request.params.key}`,
          }),
        );
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
          200: Type.Any(),
          "4xx": HttpError,
          "5xx": HttpError,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      let response;
      try {
        response = await app.s3Client.client.send(
          new GetObjectCommand({
            Bucket: app.s3Client.bucketName,
            Key: `${request.userData?.userId}/${request.params.key}`,
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

      const antivirusPassthrough = app.avClient.passthrough();
      const downloadPassthrough = new PassThrough();

      const thePromise = new Promise<void>((resolve, reject) => {
        antivirusPassthrough.once("error", (err) => {
          return reject(
            new ServerError(FILE_DOWNLOAD, "Internal server error", err),
          );
        });
        antivirusPassthrough.once("scan-complete", (result) => {
          const { isInfected } = result;
          if (isInfected) {
            return reject(
              new CustomError(FILE_DOWNLOAD, "File is infected", 400),
            );
          }
          resolve();
        });
      });

      const monitorPassThrough = new PromiseTransform(thePromise);

      pipeline(
        stream,
        antivirusPassthrough,
        monitorPassThrough,
        downloadPassthrough,
        (err) => {
          if (err) {
            app.log.error(err);
          }
        },
      );
      return reply.send(downloadPassthrough);
    },
  );
}
