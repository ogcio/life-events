import { Type } from "@sinclair/typebox";
import { FastifyInstance, FastifyRequest } from "fastify";
import { HttpError } from "../../types/httpErrors.js";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { PassThrough } from "stream";
import { pipeline } from "stream/promises";
import { Upload } from "@aws-sdk/lib-storage";

const scanAndUplad = async (app: FastifyInstance, request: FastifyRequest) => {
  const data = await request.file();

  return new Promise<void>((resolve, reject) => {
    if (!data) {
      return reject(app.multipartErrors.InvalidMultipartContentTypeError());
    }
    const stream = data.file;

    if (data.file.truncated) {
      // you may need to delete the part of the file that has been saved on disk
      // before the `limits.fileSize` has been reached
      throw app.multipartErrors.RequestFileTooLargeError();
    }

    const filename = data.filename;
    if (!filename) {
      return reject(app.httpErrors.badRequest("Filename not provided"));
    }

    const s3Config = app.s3Client;
    let scanComplete = false;
    let outputFinished = false;
    let fileInfected = false;
    const antivirusPassthrough = app.avClient.passthrough();
    antivirusPassthrough.on("error", (err) => {
      reject(app.httpErrors.internalServerError(err.message));
    });

    antivirusPassthrough.on("scan-complete", (result) => {
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
        reject(app.httpErrors.internalServerError(err));
      });

    pipeline(stream, antivirusPassthrough, s3uploadPassthrough).catch((err) => {
      app.log.error(err);
      reject(app.httpErrors.internalServerError(err));
    });

    const checkCompletion = () => {
      if (scanComplete && outputFinished) {
        if (fileInfected) {
          s3Config.client.send(
            new DeleteObjectCommand({
              Bucket: s3Config.bucketName,
              Key: filename,
            }),
            (err) => {
              if (err) {
                app.log.error(err);
                return reject(app.httpErrors.internalServerError(err));
              }
            },
          );

          return reject(app.httpErrors.badRequest("File is infected"));
        }

        resolve();
      }
    };
  });
};

export default async function routes(app: FastifyInstance) {
  app.post(
    "/upload",
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
}
