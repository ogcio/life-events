import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import EventEmitter from "events";
import { FastifyInstance, FastifyRequest } from "fastify";
import { BadRequestError, CustomError, getErrorMessage } from "shared-errors";
import { PassThrough, pipeline } from "stream";

/** THIS IS ALL DEPRECATED CODE, TO BE USED AS REFERENCE */

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

const FILE_UPLOAD = "FILE_UPLOAD";
/**
 * @deprecated This method is used as a reference
 * @param
 * @param scanAndUpload
 * @returns
 */
const scanAndUpload_ = async (
  app: FastifyInstance,
  request: FastifyRequest,
) => {
  const data = await request.file();

  if (!data) {
    throw new BadRequestError(FILE_UPLOAD, "Request is not multipart");
  }

  const stream = data.file;
  const filename = data.filename;

  if (!filename) {
    throw new BadRequestError(FILE_UPLOAD, "Filename is not provided");
  }

  const eventEmitter = new EventEmitter();

  const promise = new Promise<void>((resolve, reject) => {
    eventEmitter.once("infectedFileDetected", () => {
      reject(new CustomError(FILE_UPLOAD, "File is infected", 400));
    });

    eventEmitter.once("fileUploaded", () => {
      resolve();
    });

    eventEmitter.once("fileTooLarge", () => {
      reject(new BadRequestError(FILE_UPLOAD, "File is too large"));
    });

    eventEmitter.once("error", (err) => {
      reject(new BadRequestError("badRequest", getErrorMessage(err), err));
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
