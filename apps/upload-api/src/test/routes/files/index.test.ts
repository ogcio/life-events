import { S3Client } from "@aws-sdk/client-s3";
import { MultipartFile } from "@fastify/multipart";
import { PostgresDb } from "@fastify/postgres";
import NodeClam from "clamscan";
import { FastifyInstance, FastifyPluginCallback } from "fastify";
import fp from "fastify-plugin";
import { EventEmitter } from "node:events";
import { FieldDef } from "pg";
import { PassThrough } from "stream";
import t from "tap";
import * as authenticationFactory from "../../../utils/authentication-factory.js";
import { CONFIG_TYPE, SCHEDULER_TOKEN } from "../../../utils/storeConfig.js";

const nextTick = () =>
  new Promise<void>((resolve) => setTimeout(() => resolve()));

const decorateRequest = (
  fastify: FastifyInstance,
  data:
    | {
        file: PassThrough & { truncated: boolean };
        filename?: string;
        fields?: { [key: string]: { value: string } };
      }
    | null
    | undefined,
) => {
  fastify.decorateRequest("file", () => {
    return Promise.resolve(data as unknown as MultipartFile);
  });
};

// return new

t.test("files", async (t) => {
  let app: FastifyInstance;

  let antivirusPassthrough: PassThrough;
  let passthroughStream: PassThrough & { truncated: boolean };

  let uploadEventEmitter: EventEmitter;
  let s3SendEventEmitter: EventEmitter;
  let antivirusVersionEventEmitter: EventEmitter;
  let pgEventEmitter: EventEmitter;
  let profileSdkEventEmitter: EventEmitter;

  // supply type param so that TS knows what it returns
  const { build } = await t.mockImport<typeof import("../../../app.js")>(
    "../../../app.js",
    {
      "@fastify/autoload": {
        default: async () => {},
      },

      "../../../routes/index.js": {
        default: async () => {},
      },
      "@fastify/multipart": {
        default: fp(async (fastify) => {
          fastify.addContentTypeParser(
            "multipart/form-data",
            (req, payload, done) => done(null),
          );
        }),
      },
      "@fastify/postgres": {
        default: fp(async (fastify) => {
          fastify.decorate("pg", {
            query: () => {
              return new Promise<{
                rows: unknown;
                rowCount: number;
                command: string;
                oid: number;
                fields: FieldDef[];
              }>((resolve, reject) => {
                pgEventEmitter.once("error", (err) => reject(err));
                pgEventEmitter.once("done", (data) => {
                  resolve({
                    rows: data,
                    command: "",
                    rowCount: data?.length,
                    oid: 1,
                    fields: [],
                  });
                });
              });
            },
          } as unknown as PostgresDb & Record<string, PostgresDb>);
        }),
      },

      "api-auth": {
        default: fp(async (fastify) => {
          fastify.decorate("checkPermissions", async (request) => {
            request.userData = {
              isM2MApplication: false,
              userId: "userId",
              accessToken: "accessToken",
              organizationId: "ogcio",
            };
          });
        }),
      },
      "../../../utils/storeConfig.js": {
        storeConfig: () => Promise.resolve(),
        CONFIG_TYPE,
        SCHEDULER_TOKEN,
      },
      "../../../utils/scheduleCleanupTask.js": {
        default: () => Promise.resolve(),
      },
    },
  );

  const routes = await t.mockImport<
    typeof import("../../../routes/files/index.js")
  >("../../../routes/files/index.js", {
    "@aws-sdk/lib-storage": {
      Upload: class {
        constructor() {}

        async done() {
          return new Promise<void>((resolve, reject) => {
            uploadEventEmitter.once("fileUploaded", (data) => {
              resolve(data);
            });
            uploadEventEmitter.once("upload-error", () => {
              reject(new Error("upload error"));
            });
          });
        }
      },
    },
    "../../../routes/files/utils/getFilename.js": {
      default: (pg: unknown, filename: string) => Promise.resolve(filename),
    },
    "../../../utils/authentication-factory.js": t.createMock(
      authenticationFactory,
      {
        getProfileSdk: () =>
          Promise.resolve({
            selectUsers: () =>
              new Promise<void>((resolve, reject) => {
                profileSdkEventEmitter.on("done", (data) => resolve(data));
                profileSdkEventEmitter.on("error", (err) => reject(err));
              }),
          }),
      },
    ),
  });

  const s3Plugin = fp(
    async (fastify) => {
      fastify.decorate("s3Client", {
        config: {
          region: "region",
          endpoint: "",
          forcePathStyle: true,
        },
        bucketName: "",
        client: {
          send: () =>
            new Promise((resolve, reject) => {
              s3SendEventEmitter.once("send-error", (err) => {
                if (err) {
                  reject(err);
                } else reject(new Error("send-error"));
              });
              s3SendEventEmitter.once("sendComplete", (data) => {
                resolve(data);
              });
            }),
        } as unknown as S3Client,
      });
    },
    { name: "s3ClientPlugin" },
  );

  t.beforeEach(async () => {
    uploadEventEmitter = new EventEmitter();
    s3SendEventEmitter = new EventEmitter();
    antivirusVersionEventEmitter = new EventEmitter();
    pgEventEmitter = new EventEmitter();
    profileSdkEventEmitter = new EventEmitter();
    app = await build();

    antivirusPassthrough = new PassThrough();
    passthroughStream = new PassThrough() as PassThrough & {
      truncated: boolean;
    };
    const clamscanPlugin = fp(
      async (fastify) => {
        fastify.decorate("avClient", {
          passthrough: () => antivirusPassthrough,
          getVersion: () => {
            return new Promise((resolve) => {
              antivirusVersionEventEmitter.on("version", (data) =>
                resolve(data),
              );
            });
          },
        } as NodeClam);
      },
      { name: "clamscanPlugin" },
    );

    await app.register(s3Plugin);
    await app.register(clamscanPlugin);
    await app.register(routes as unknown as FastifyPluginCallback, {
      prefix: "/files",
    });
  });

  t.afterEach(async () => {
    await app.close();
  });

  t.test("upload", async (t) => {
    t.test(
      "Should throw an error when the request is not multipart",
      async (t) => {
        decorateRequest(app, null);

        const response = await app.inject({
          method: "POST",
          url: "/files",
        });

        t.equal(response.statusCode, 400);
        t.equal(
          response.headers["content-type"],
          "application/json; charset=utf-8",
        );
        t.equal(response.json().detail, "Request is not multipart");
      },
    );

    t.test("Should throw and error when uploaded file is too large", (t) => {
      decorateRequest(app, {
        file: passthroughStream,
        filename: "tooBig.txt",
        fields: {},
      });

      app
        .inject({
          method: "POST",
          url: "/files",
        })
        .then((response) => {
          t.equal(response.statusCode, 400);
          t.equal(response.json().detail, "File is too large");
          t.end();
        });

      setTimeout(() => {
        passthroughStream.truncated = true;
        passthroughStream.emit("limit");
      });
    });

    t.test("Should reject when file is infected", async (t) => {
      decorateRequest(app, {
        file: passthroughStream,
        filename: "sample.txt",
        fields: {},
      });

      app
        .inject({
          method: "POST",
          url: "/files",
        })
        .then((response) => {
          t.equal(response.statusCode, 400);
          t.equal(response.json().detail, "File is infected");
        });

      passthroughStream.end(Buffer.alloc(1));
      await nextTick();
      antivirusPassthrough.emit("scan-complete", {
        isInfected: true,
        viruses: ["virus signature"],
      });
      await nextTick();
      antivirusVersionEventEmitter.emit(
        "version",
        "ClamAV 1.2.3/27364/Sun Aug 11 08:37:34 2024\n",
      );
      await nextTick();
      pgEventEmitter.emit("done");
      await nextTick();
    });

    t.test(
      "Should return a 200 status code when file is uploaded with no expiration date",
      async (t) => {
        decorateRequest(app, {
          file: passthroughStream,
          filename: "sample.txt",
          fields: {},
        });

        app
          .inject({
            method: "POST",
            url: "/files",
          })
          .then((response) => {
            t.equal(response.statusCode, 201);
            t.end();
          });

        passthroughStream.end(Buffer.alloc(1));
        await nextTick();
        antivirusVersionEventEmitter.emit("version", "");
        await nextTick();
        uploadEventEmitter.emit("fileUploaded", { Key: "key" });
        await nextTick();
        pgEventEmitter.emit("done", [{ id: "1" }]);
        await nextTick();
        antivirusPassthrough.emit("scan-complete", { isInfected: false });
      },
    );

    t.test(
      "Should return a 200 status code when file is uploaded with expiration date",
      async (t) => {
        decorateRequest(app, {
          file: passthroughStream,
          filename: "sample.txt",
          fields: { expirationDate: { value: "2024-01-01T10:00" } },
        });

        app
          .inject({
            method: "POST",
            url: "/files",
          })
          .then((response) => {
            t.equal(response.statusCode, 201);
            t.end();
          });

        passthroughStream.end(Buffer.alloc(1));
        await nextTick();
        antivirusVersionEventEmitter.emit("version", "");
        await nextTick();
        uploadEventEmitter.emit("fileUploaded", { Key: "key" });
        await nextTick();
        pgEventEmitter.emit("done", [{ id: "1" }]);
        await nextTick();
        antivirusPassthrough.emit("scan-complete", { isInfected: false });
      },
    );

    t.test("should return an error when filename is not provided", (t) => {
      decorateRequest(app, { file: passthroughStream, fields: {} });

      app
        .inject({
          method: "POST",
          url: "/files",
        })
        .then((response) => {
          t.equal(response.statusCode, 400);
          t.equal(response.json().detail, "Filename is not provided");
          t.end();
        });
    });

    t.test("should return an error when a dotfile is uploaded", (t) => {
      decorateRequest(app, {
        file: passthroughStream,
        filename: ".env",
        fields: {},
      });

      app
        .inject({
          method: "POST",
          url: "/files",
        })
        .then((response) => {
          t.equal(response.statusCode, 400);
          t.equal(response.json().detail, "File not allowed");
          t.end();
        });
    });

    t.test(
      "should return an error when a a file with a forbidden extension is uploaded",
      (t) => {
        decorateRequest(app, {
          file: passthroughStream,
          filename: "test.exe",
          fields: {},
        });

        app
          .inject({
            method: "POST",
            url: "/files",
          })
          .then((response) => {
            t.equal(response.statusCode, 400);
            t.equal(response.json().detail, "File not allowed");
            t.end();
          });
      },
    );

    t.test(
      "should return an error when a a file with no extension is uploaded",
      (t) => {
        decorateRequest(app, {
          file: passthroughStream,
          filename: "test",
          fields: {},
        });

        app
          .inject({
            method: "POST",
            url: "/files",
          })
          .then((response) => {
            t.equal(response.statusCode, 400);
            t.equal(response.json().detail, "File not allowed");
            t.end();
          });
      },
    );

    t.test("should return an error when AV scan fails in POST", async (t) => {
      decorateRequest(app, {
        file: passthroughStream,
        filename: "sample.txt",
        fields: {},
      });

      app
        .inject({
          method: "POST",
          url: "/files",
        })
        .then((response) => {
          t.equal(response.statusCode, 500);
          t.end();
        });

      passthroughStream.end(Buffer.alloc(1));
      await nextTick();

      antivirusPassthrough.emit("error", new Error("scan error"));
      await nextTick();
    });

    t.test("should return an error when upload fails", async (t) => {
      decorateRequest(app, {
        file: passthroughStream,
        filename: "sample.txt",
        fields: {},
      });

      app
        .inject({
          method: "POST",
          url: "/files",
        })
        .then((response) => {
          t.equal(response.statusCode, 500);
          t.end();
        });

      antivirusPassthrough.emit("scan-complete", { isInfected: false });
      await nextTick();
      uploadEventEmitter.emit("upload-error", new Error("upload error"));
      await nextTick();
    });

    t.test(
      "should return an error when the file stream throws an error",
      async (t) => {
        decorateRequest(app, {
          file: passthroughStream,
          filename: "sample.txt",
          fields: {},
        });

        app
          .inject({
            method: "POST",
            url: "/files",
          })
          .then((response) => {
            t.equal(response.statusCode, 500);
            t.end();
          });

        passthroughStream.end(Buffer.alloc(1));
        await nextTick();
        passthroughStream.emit("error", new Error("stream error"));
        await nextTick();
      },
    );

    t.test(
      "should return an error when the pg connection throws",
      async (t) => {
        decorateRequest(app, {
          file: passthroughStream,
          filename: "sample.txt",
          fields: {},
        });

        app
          .inject({
            method: "POST",
            url: "/files",
          })
          .then((response) => {
            t.equal(response.statusCode, 500);
          });

        await nextTick();
        passthroughStream.end(Buffer.alloc(1));
        uploadEventEmitter.emit("fileUploaded", { Key: "key" });
        await nextTick();
        antivirusVersionEventEmitter.emit("version", "");
        await nextTick();
        antivirusPassthrough.emit("scan-complete", { isInfected: false });
        await nextTick();
        pgEventEmitter.emit("error", new Error("pg error"));
        await nextTick();
      },
    );
  });

  t.test("get", async (t) => {
    t.test("should return a 404 when a file is not found on s3", async (t) => {
      app
        .inject({
          method: "GET",
          url: "/files/dummyfile.txt",
        })
        .then((response) => {
          t.equal(response.statusCode, 404);
          t.end();
        });

      await nextTick();
      pgEventEmitter.emit("done", [{}]);
      await nextTick();
      s3SendEventEmitter.emit("send-error", {
        $metadata: { httpStatusCode: 404 },
      });
      await nextTick();
      pgEventEmitter.emit("done", []);
      await nextTick();
    });

    t.test("should return a 404 when file metadata is not found", async (t) => {
      app
        .inject({
          method: "GET",
          url: "/files/dummyfile.txt",
        })
        .then((response) => {
          t.equal(response.statusCode, 404);
          t.end();
        });

      await nextTick();
      pgEventEmitter.emit("done", []);
      await nextTick();
    });

    t.test(
      "should return a 400 error when trying to get an infected file",
      async (t) => {
        app
          .inject({
            method: "GET",
            url: "/files/dummyfile.txt",
          })
          .then((response) => {
            t.equal(response.statusCode, 400);
            t.end();
          });

        await nextTick();
        pgEventEmitter.emit("done", [{ infected: true }]);
        await nextTick();
      },
    );

    t.test("should return a 500 when an error happens in s3", async (t) => {
      app
        .inject({
          method: "GET",
          url: "/files/dummyfile.txt",
        })
        .then((response) => {
          t.equal(response.statusCode, 500);
          t.end();
        });

      await nextTick();
      pgEventEmitter.emit("done", [{}]);
      await nextTick();
      s3SendEventEmitter.emit("send-error", {
        $metadata: { httpStatusCode: 500 },
      });
      await nextTick();
    });

    t.test(
      "should return a 500 when body is not present in the response",
      async (t) => {
        app
          .inject({
            method: "GET",
            url: "/files/dummyfile.txt",
          })
          .then((response) => {
            t.equal(response.statusCode, 500);
            t.end();
          });

        await nextTick();
        pgEventEmitter.emit("done", [{}]);
        await nextTick();
        s3SendEventEmitter.emit("sendComplete", {});
        await nextTick();
      },
    );

    t.test(
      "should return a stream when file downloads correctly",
      async (t) => {
        app
          .inject({
            method: "GET",
            url: "/files/file.txt",
          })
          .then((response) => {
            t.equal(response.statusCode, 200);
            t.end();
          });

        await nextTick();
        pgEventEmitter.emit("done", [{}]);
        await nextTick();
        const stream = new PassThrough();
        s3SendEventEmitter.emit("sendComplete", {
          Body: { transformToWebStream: () => stream },
        });
        await nextTick();
        stream.push(Buffer.alloc(1));
        stream.push(Buffer.alloc(1));
        stream.end();
        await nextTick();
        antivirusVersionEventEmitter.emit("version", "");
        await nextTick();
        antivirusPassthrough.emit("scan-complete", {
          isInfected: false,
          viruses: [],
        });
        await nextTick();
        pgEventEmitter.emit("done", []);
        await nextTick();
      },
    );

    t.test(
      "should return the stream whenn AV throws an error in GET",
      async (t) => {
        app
          .inject({
            method: "GET",
            url: "/files/file.txt",
          })
          .then((r) => {
            t.equal(r.statusCode, 200);
            t.end();
          });

        await nextTick();
        pgEventEmitter.emit("done", [
          { filename: "filename", mimetype: "text/plain", fileSize: 100 },
        ]);
        await nextTick();

        const stream = new PassThrough();
        s3SendEventEmitter.emit("sendComplete", {
          Body: { transformToWebStream: () => stream },
        });
        stream.end(Buffer.alloc(1));
        await nextTick();

        antivirusVersionEventEmitter.emit("version", "");
        await nextTick();
        antivirusPassthrough.emit("error");
        await nextTick();
        antivirusPassthrough.emit("scan-complete", {
          isInfected: false,
          viruses: [],
        });
        await nextTick();
      },
    );

    t.test(
      "should return an error when an infected file is downloaded",
      async (t) => {
        app
          .inject({
            method: "GET",
            url: "/files/file.txt",
          })
          .then((r) => {
            t.equal(r.statusCode, 500);
            t.end();
          })
          .catch((err) => {
            t.equal(err, undefined);
            t.end();
          });

        await nextTick();
        pgEventEmitter.emit("done", [
          { filename: "filename", mimetype: "text/plain", fileSize: 100 },
        ]);
        await nextTick();
        const stream = new PassThrough();
        s3SendEventEmitter.emit("sendComplete", {
          Body: { transformToWebStream: () => stream },
        });
        await nextTick();
        stream.end(Buffer.alloc(1));
        await nextTick();
        antivirusVersionEventEmitter.emit("version", "");
        await nextTick();
        antivirusPassthrough.emit("scan-complete", {
          isInfected: true,
          viruses: ["v1"],
        });
        await nextTick();
        s3SendEventEmitter.emit("sendComplete");
        await nextTick();
        pgEventEmitter.emit("done", []);
        await nextTick();
      },
    );

    t.test("should log the error if s3 deletion throws", async (t) => {
      const logger = app.log.error;
      const errorLog: string[] = [];
      app.log.error = (...params: unknown[]) => {
        const _error = params[0] as { message: string };
        errorLog.push(_error.message);
        logger(params);
      };

      app
        .inject({
          method: "GET",
          url: "/files/file.txt",
        })
        .catch(() => {
          const expectedError = errorLog.some((m) => m === "send-error");

          t.equal(expectedError, true);
          t.end();
        });

      await nextTick();
      pgEventEmitter.emit("done", [
        { filename: "filename", mimetype: "text/plain", fileSize: 100 },
      ]);
      await nextTick();
      const stream = new PassThrough();
      s3SendEventEmitter.emit("sendComplete", {
        Body: { transformToWebStream: () => stream },
      });
      await nextTick();
      stream.end(Buffer.alloc(1));
      await nextTick();
      antivirusVersionEventEmitter.emit("version", "");
      await nextTick();
      antivirusPassthrough.emit("scan-complete", {
        isInfected: true,
        viruses: ["v1"],
      });
      await nextTick();
      s3SendEventEmitter.emit("send-error");
      await nextTick();
      pgEventEmitter.emit("done", []);
      await nextTick();
    });

    t.test("should log the error if file metadata update fails", async (t) => {
      const logger = app.log.error;
      const errorLog: string[] = [];
      app.log.error = (...params: unknown[]) => {
        const _error = params[0] as { message: string };
        errorLog.push(_error.message);
        logger(params);
      };

      app
        .inject({
          method: "GET",
          url: "/files/file.txt",
        })
        .catch(() => {
          const expectedError = errorLog.some((m) => m === "dummy");

          t.equal(expectedError, true);
          t.end();
        });

      await nextTick();
      pgEventEmitter.emit("done", [
        { filename: "filename", mimetype: "text/plain", fileSize: 100 },
      ]);

      await nextTick();
      const stream = new PassThrough();
      s3SendEventEmitter.emit("sendComplete", {
        Body: { transformToWebStream: () => stream },
      });
      await nextTick();
      stream.end(Buffer.alloc(1));
      await nextTick();
      antivirusVersionEventEmitter.emit("version", "");
      await nextTick();
      antivirusPassthrough.emit("scan-complete", {
        isInfected: true,
        viruses: ["v1"],
      });
      await nextTick();
      s3SendEventEmitter.emit("sendComplete");
      await nextTick();
      pgEventEmitter.emit("error", new Error("dummy"));
      await nextTick();
    });
  });
});
