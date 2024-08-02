import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { equal } from "node:assert";
import { EventEmitter } from "node:events";
import { PassThrough } from "stream";
import t from "tap";

const decorateRequest = (fastify: FastifyInstance, data) => {
  fastify.decorateRequest("file", () => {
    return Promise.resolve(data);
  });
};
// return new

t.test("files", async (t) => {
  let app: FastifyInstance;

  let antivirusPassthrough: PassThrough;
  let passthroughStream: PassThrough;

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
      "api-auth": {
        default: fp(async (fastify) => {
          fastify.decorate("checkPermissions", () => {});
        }),
      },
    },
  );
  const uploadEventEmitter = new EventEmitter();
  const s3SendEventEmitter = new EventEmitter();

  const routes = await t.mockImport<
    typeof import("../../../routes/files/index.js")
  >("../../../routes/files/index.js", {
    "@aws-sdk/lib-storage": {
      Upload: class {
        constructor(config) {}

        async done() {
          return new Promise<void>((resolve, reject) => {
            uploadEventEmitter.once("fileUploaded", () => {
              resolve();
            });
            uploadEventEmitter.once("upload-error", () => {
              reject(new Error("upload error"));
            });
          });
        }
      },
    },
  });

  const s3Plugin = fp(
    async (fastify) => {
      fastify.decorate("s3Client", {
        config: {},
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
        },
      });
    },
    { name: "s3ClientPlugin" },
  );

  t.beforeEach(async () => {
    app = await build();

    antivirusPassthrough = new PassThrough();
    passthroughStream = new PassThrough();
    const clamscanPlugin = fp(
      async (fastify) => {
        fastify.decorate("avClient", {
          passthrough: () => antivirusPassthrough,
        });
      },
      { name: "clamscanPlugin" },
    );

    await app.register(s3Plugin);
    await app.register(clamscanPlugin);
    await app.register(routes, { prefix: "/files" });
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

    t.test("Should reject when file is infected", (t) => {
      decorateRequest(app, {
        file: passthroughStream,
        filename: "sample.txt",
      });

      app
        .inject({
          method: "POST",
          url: "/files",
        })
        .then((response) => {
          t.equal(response.statusCode, 400);
          t.equal(response.json().detail, "File is infected");
          t.end();
        });

      passthroughStream.end(Buffer.alloc(1));
      setTimeout(() => {
        antivirusPassthrough.emit("scan-complete", { isInfected: true });
        s3SendEventEmitter.emit("sendComplete");
      });
    });

    t.test("Should return a 200 status code when file is uploaded", (t) => {
      decorateRequest(app, {
        file: passthroughStream,
        filename: "sample.txt",
      });

      app
        .inject({
          method: "POST",
          url: "/files",
        })
        .then((response) => {
          t.equal(response.statusCode, 200);
          t.end();
        });

      passthroughStream.end(Buffer.alloc(1));
      setTimeout(() => {
        uploadEventEmitter.emit("fileUploaded");
        antivirusPassthrough.emit("scan-complete", { isInfected: false });
      });
    });

    t.test(
      "Should return a 400 status code when an error in deletion happens",
      { skip: "Legacy test" },
      (t) => {
        decorateRequest(app, {
          file: passthroughStream,
          filename: "sample.txt",
        });

        app
          .inject({
            method: "POST",
            url: "/files",
          })
          .then((response) => {
            t.equal(response.statusCode, 400);
            t.end();
          });

        setTimeout(() => {
          passthroughStream.truncated = true;
          // passthroughStream.emit("limit");
          // passthroughStream.push("");
          uploadEventEmitter.emit("fileUploaded");
          antivirusPassthrough.emit("scan-complete", { isInfected: false });
          // // passthroughStream.push(Buffer.alloc(1));
          // // streamPassThrough.end();
          setTimeout(() => {
            s3SendEventEmitter.emit("send-error");
          });
        });
      },
    );

    t.test(
      "should return a 400 status code when an error happens in deleting infected file",
      { skip: "Legacy test" },
      (t) => {
        decorateRequest(app, {
          file: passthroughStream,
          filename: "sample.txt",
        });

        app
          .inject({
            method: "POST",
            url: "/files",
          })
          .then((response) => {
            t.equal(response.statusCode, 400);
            t.end();
          });

        setTimeout(() => {
          uploadEventEmitter.emit("fileUploaded");
          antivirusPassthrough.emit("scan-complete", { isInfected: true });
          setTimeout(() => {
            s3SendEventEmitter.emit("send-error");
          });
        });
      },
    );

    t.test("should return an error when filename is not provided", (t) => {
      decorateRequest(app, { file: passthroughStream });

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

    t.test("should return an error when AV scan fails in POST", (t) => {
      decorateRequest(app, {
        file: passthroughStream,
        filename: "sample.txt",
      });

      app
        .inject({
          method: "POST",
          url: "/files",
        })
        .then((response) => {
          t.equal(response.statusCode, 400);
          t.end();
        });

      passthroughStream.end(Buffer.alloc(1));
      setTimeout(() => {
        antivirusPassthrough.emit("error", new Error("scan error"));
      });
    });

    t.test("should return an error when upload fails", (t) => {
      decorateRequest(app, {
        file: passthroughStream,
        filename: "sample.txt",
      });

      app
        .inject({
          method: "POST",
          url: "/files",
        })
        .then((response) => {
          t.equal(response.statusCode, 400);
          t.end();
        });

      setTimeout(() => {
        antivirusPassthrough.emit("scan-complete", { isInfected: false });
        uploadEventEmitter.emit("upload-error", new Error("upload error"));
      });
    });

    t.test(
      "should return an error when the file stream throws an error",
      (t) => {
        decorateRequest(app, {
          file: passthroughStream,
          filename: "sample.txt",
        });

        app
          .inject({
            method: "POST",
            url: "/files",
          })
          .then((response) => {
            t.equal(response.statusCode, 400);
            t.end();
          });

        passthroughStream.end(Buffer.alloc(1));
        setTimeout(() => {
          passthroughStream.emit("error", new Error("stream error"));
        });
      },
    );
  });

  t.test("list", async (t) => {
    t.test("Should return a list of all files uploaded by a user", (t) => {
      app
        .inject({
          method: "GET",
          url: "/files",
        })
        .then((response) => {
          t.same(response.json(), {
            data: [
              {
                url: "http://localhost:8008/api/v1/files/file1.txt",
                key: "file1.txt",
                size: 100,
              },
            ],
          });

          t.equal(response.statusCode, 200);
          t.end();
        });

      setTimeout(() => {
        s3SendEventEmitter.emit("sendComplete", {
          Contents: [{ Key: "file1.txt", Size: 100 }],
        });
      });
    });

    t.test("Should return a empty array when no files are available", (t) => {
      app
        .inject({
          method: "GET",
          url: "/files",
        })
        .then((response) => {
          t.same(response.json(), { data: [] });

          t.equal(response.statusCode, 200);
          t.end();
        });

      setTimeout(() => {
        s3SendEventEmitter.emit("sendComplete", {
          Contents: undefined,
        });
      });
    });

    t.test("Should throw an errror when list files throws", (t) => {
      app
        .inject({
          method: "GET",
          url: "/files",
        })
        .then((response) => {
          t.equal(response.statusCode, 500);
          t.end();
        });

      setTimeout(() => {
        s3SendEventEmitter.emit("send-error");
      });
    });
  });

  t.test("delete", async (t) => {
    t.test("Should throw an error when DELETE with no key is called", (t) => {
      app
        .inject({
          method: "DELETE",
          url: "/files/",
        })
        .then((response) => {
          t.equal(response.statusCode, 400);
          t.end();
        });
    });

    t.test("Should delete a file successfully", (t) => {
      app
        .inject({
          method: "DELETE",
          url: "/files/dummyfile.txt",
        })
        .then((response) => {
          t.equal(response.statusCode, 200);
          t.end();
        });

      setTimeout(() => {
        s3SendEventEmitter.emit("sendComplete");
      });
    });

    t.test("should throw an error when delete fails", (t) => {
      app
        .inject({
          method: "DELETE",
          url: "/files/dummyfile.txt",
        })
        .then((response) => {
          t.equal(response.statusCode, 500);
          t.end();
        });

      setTimeout(() => {
        s3SendEventEmitter.emit("send-error");
      });
    });

    t.test("should return a 404 when a file is not found on s3", (t) => {
      app
        .inject({
          method: "GET",
          url: "/files/dummyfile.txt",
        })
        .then((response) => {
          t.equal(response.statusCode, 404);
          t.end();
        });

      setTimeout(() => {
        s3SendEventEmitter.emit("send-error", {
          $metadata: { httpStatusCode: 404 },
        });
      });
    });

    t.test("should return a 500 when an error happens in s3", (t) => {
      app
        .inject({
          method: "GET",
          url: "/files/dummyfile.txt",
        })
        .then((response) => {
          t.equal(response.statusCode, 500);
          t.end();
        });

      setTimeout(() => {
        s3SendEventEmitter.emit("send-error", {
          $metadata: { httpStatusCode: 500 },
        });
      });
    });
  });

  t.test("get", async (t) => {
    t.test(
      "should return a 500 when body is not present in the response",
      (t) => {
        app
          .inject({
            method: "GET",
            url: "/files/dummyfile.txt",
          })
          .then((response) => {
            t.equal(response.statusCode, 500);
            t.end();
          });

        setTimeout(() => {
          s3SendEventEmitter.emit("sendComplete", {});
        });
      },
    );

    t.test(
      "should return a 500 when body is not present in the response",
      (t) => {
        app
          .inject({
            method: "GET",
            url: "/files/dummyfile.txt",
          })
          .then((response) => {
            t.equal(response.statusCode, 500);
            t.end();
          });

        setTimeout(() => {
          s3SendEventEmitter.emit("sendComplete", {});
        });
      },
    );

    t.test("should return a stream when file downloads correctly", (t) => {
      app
        .inject({
          method: "GET",
          url: "/files/file.txt",
        })
        .then((response) => {
          t.equal(response.statusCode, 200);
          t.end();
        });

      setTimeout(() => {
        const stream = new PassThrough();
        s3SendEventEmitter.emit("sendComplete", {
          Body: { transformToWebStream: () => stream },
        });
        stream.push(Buffer.alloc(1));
        stream.push(Buffer.alloc(1));
        stream.end();
        setTimeout(() => {
          antivirusPassthrough.emit("scan-complete", { isInfected: false });
        });
      });
    });

    t.test("should return an error when AV scan fails in GET", (t) => {
      app
        .inject({
          method: "GET",
          url: "/files/file.txt",
        })
        .then((r) => {
          t.equal(r.statusCode, 500);
          t.end();
        });

      setTimeout(() => {
        const stream = new PassThrough();
        s3SendEventEmitter.emit("sendComplete", {
          Body: { transformToWebStream: () => stream },
        });
        stream.end(Buffer.alloc(1));

        setTimeout(() => {
          antivirusPassthrough.emit("error", new Error("scan error"));
        });
      });
    });

    t.test(
      "should return an error when an infected file is downloaded",
      (t) => {
        app
          .inject({
            method: "GET",
            url: "/files/file.txt",
          })
          .then((r) => {
            t.equal(r.statusCode, 400);
            t.equal(r.json().detail, "File is infected");
            t.end();
          })
          .catch((err) => {
            t.equal(err, undefined);
            t.end();
          });

        setTimeout(() => {
          const stream = new PassThrough();
          s3SendEventEmitter.emit("sendComplete", {
            Body: { transformToWebStream: () => stream },
          });
          stream.end(Buffer.alloc(1));

          setTimeout(() => {
            antivirusPassthrough.emit("scan-complete", { isInfected: true });
          });
        });
      },
    );
  });
});
