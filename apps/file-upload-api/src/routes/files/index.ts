import { Type } from "@sinclair/typebox";
import { FastifyInstance, FastifyRequest } from "fastify";
import { HttpError } from "../../types/httpErrors.js";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { PassThrough, Readable, Transform } from "stream";
import { EventEmitter } from "node:events";
import { pipeline } from "stream";
import { Upload } from "@aws-sdk/lib-storage";
import { Object } from "../../types/schemaDefinitions.js";

import { httpErrors } from "@fastify/sensible";

const permissions = {
  citizen: {
    test: "upload:object.self:read",
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

const scanAndUplad = async (app: FastifyInstance, request: FastifyRequest) => {
  const data = await request.file();

  if (!data) {
    throw app.httpErrors.badRequest("Request is not multipart");
  }

  const stream = data.file;
  const filename = data.filename;

  if (!filename) {
    throw app.httpErrors.badRequest("Filename not provided");
  }

  const eventEmitter = new EventEmitter();

  const promise = new Promise<void>((resolve, reject) => {
    eventEmitter.once("infectedFileDetected", () => {
      reject(app.httpErrors.badRequest("File is infected"));
    });

    eventEmitter.once("fileUploaded", () => {
      resolve();
    });

    eventEmitter.once("fileTooLarge", () => {
      reject(app.httpErrors.badRequest("File too large"));
    });

    eventEmitter.once("error", (err) => {
      app.log.error(err);
      reject(app.httpErrors.badRequest(err.message));
    });
    eventEmitter.on("error", () => {
      //noop to prevent unhandled promise rejection and double error logging
    });
  });

  const s3Config = app.s3Client;
  let scanComplete = false;
  let outputFinished = false;
  let fileInfected = false;
  const checkCompletion = () => {
    if (!scanComplete || !outputFinished) {
      return;
    }

    if (data.file.truncated) {
      deleteObject(s3Config.client, s3Config.bucketName, filename)
        .then(() => eventEmitter.emit("fileTooLarge"))
        .catch((err) => {
          eventEmitter.emit("error", err);
        });
    } else if (fileInfected) {
      deleteObject(s3Config.client, s3Config.bucketName, filename)
        .then(() => eventEmitter.emit("infectedFileDetected"))
        .catch((err) => {
          eventEmitter.emit("error", err);
        });
    } else {
      eventEmitter.emit("fileUploaded");
    }
  };

  stream.on("limit", () => {
    if (data.file.truncated) {
      eventEmitter.emit("fileTooLarge");
    }
  });

  const antivirusPassthrough = app.avClient.passthrough();

  antivirusPassthrough.once("error", (err) => {
    eventEmitter.emit("error", err);
  });

  antivirusPassthrough.once("scan-complete", (result) => {
    const { isInfected } = result;
    if (isInfected) {
      fileInfected = true;
    }
    scanComplete = true;
    checkCompletion();
  });

  const s3uploadPassthrough = new PassThrough();

  const upload = new Upload({
    client: s3Config.client,
    queueSize: 4, // optional concurrency configuration
    leavePartsOnError: false, // optional manually handle dropped parts
    params: {
      Bucket: s3Config.bucketName,
      Key: filename,
      Body: s3uploadPassthrough,
    },
  });

  upload
    .done()
    .then(() => {
      outputFinished = true;

      checkCompletion();
    })
    .catch((err) => {
      eventEmitter.emit("error", err);
      return;
    });

  pipeline(stream, antivirusPassthrough, s3uploadPassthrough, (err) => {
    if (err) {
      eventEmitter.emit("error", err);
    }
  });

  return promise;
};

export default async function routes(app: FastifyInstance) {
  // app.addHook("preValidation", async (request, reply) => {
  //   await app.checkPermissions(request, reply, [permissions.citizen.test]);
  // });

  app.post(
    "/",
    {
      schema: {
        consumes: ["multipart/form-data"],
        tags: ["Files"],
        response: {
          200: Type.Object({ message: Type.String() }),
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      await scanAndUplad(app, request);

      reply.send({ message: "File uploaded successfully" });
    },
  );

  app.get(
    "/",
    {
      schema: {
        tags: ["Files"],
        response: {
          200: Type.Array(Object),
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      let response = null;
      try {
        const data = await app.s3Client.client.send(
          new ListObjectsCommand({ Bucket: app.s3Client.bucketName }),
        );
        response =
          data.Contents?.map((item) => ({
            url: `${app.config.S3_ENDPOINT}/${app.s3Client.bucketName}/${item.Key}`,
            key: item.Key,
            size: item.Size,
          })) || [];
      } catch (err) {
        throw app.httpErrors.internalServerError();
      }

      reply.send(response);
    },
  );

  app.delete<{ Params: { key: string } }>(
    "/:key",
    {
      schema: {
        tags: ["Files"],
        params: Type.Object({ key: Type.String() }),
        response: {
          200: Type.Object({ message: Type.String() }),
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      if (!request.params.key) {
        throw app.httpErrors.badRequest("Key not provided");
      }
      try {
        await app.s3Client.client.send(
          new DeleteObjectCommand({
            Bucket: app.s3Client.bucketName,
            Key: request.params.key,
          }),
        );
      } catch (err) {
        throw app.httpErrors.internalServerError();
      }

      reply.send({ message: "File deleted succesfully" });
    },
  );

  app.get<{ Params: { key: string } }>(
    "/:key",
    {
      schema: {
        tags: ["Files"],
        params: Type.Object({ key: Type.String() }),
        response: {
          // 200: Type.Object({ message: Type.String() }),
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
            Key: request.params.key,
          }),
        );
      } catch (err) {
        const err_ = err as { $metadata: { httpStatusCode: number } };
        if (err_.$metadata.httpStatusCode === 404) {
          throw app.httpErrors.notFound();
        } else {
          throw app.httpErrors.internalServerError();
        }
      }

      const body = response.Body;
      if (!body) {
        throw app.httpErrors.internalServerError();
      }

      const stream = body.transformToWebStream();

      const antivirusPassthrough = app.avClient.passthrough();
      const downloadPassthrough = new PassThrough();

      const thePromise = new Promise<void>((resolve, reject) => {
        antivirusPassthrough.once("error", (err) => {
          return reject(err);
        });
        antivirusPassthrough.once("scan-complete", (result) => {
          const { isInfected } = result;
          if (isInfected) {
            return reject("File is infected");
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
            // reply.app.log // downloadPassthrough.destroy();
            // .error(er);
            // console.log(err);
            app.log.error(err);
            // throw err;
            // reply.hijack();
            // reply.raw.end(app.httpErrors.internalServerError());
          }
        },
      );
      return reply.send(downloadPassthrough);
    },
  );
}

class PromiseTransform extends Transform {
  private aPromise;
  // private lastChunk;

  constructor(aPromise: Promise<void>, options = {}) {
    super(options);
    this.aPromise = aPromise;
  }

  _transform(chunk: Buffer, encoding: string, callback: () => void) {
    this.push(chunk);
    callback();
    // if (this.lastChunk) {
    //   console.log("last chunk true");
    //   if (!this.push(this.lastChunk)) {
    //     console.log("push negative, draining");
    //     this.once("drain", callback);
    //   } else {
    //     console.log("push positive callback");
    //     callback();
    //   }
    // } else {
    //   callback();
    // }
    // this.lastChunk = chunk;
  }

  _flush(callback: () => void) {
    this.aPromise
      .then(() => {
        // if (this.lastChunk) {
        //   this.push(this.lastChunk);
        // } else {
        //   this.push();
        // }
        callback();
      })
      .catch(callback);
  }
}
