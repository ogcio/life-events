import { PostgresDb } from "@fastify/postgres";
import { FastifyInstance, FastifyPluginCallback } from "fastify";
import fp from "fastify-plugin";
import t from "tap";

const buildApp = async ({
  removeFileSharing,
  addFileSharing,
}: {
  removeFileSharing?: () => Promise<unknown>;
  addFileSharing?: () => Promise<unknown>;
}) => {
  const { build } = await t.mockImport<typeof import("../../../../app.js")>(
    "../../../../app.js",
    {
      "@fastify/autoload": {
        default: async () => {},
      },

      "../../../../routes/index.js": {
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
            pool: {
              connect: () =>
                Promise.resolve({
                  release: () => Promise.resolve(),
                }),
            },
          } as unknown as PostgresDb & Record<string, PostgresDb>);
        }),
      },

      "api-auth": {
        default: fp(async (fastify) => {
          fastify.decorate("checkPermissions", async (request) => {
            request.userData = {
              userId: "userId",
              accessToken: "accessToken",
              organizationId: "ogcio",
            };
          });
        }),
      },
    },
  );

  const routes = await t.mockImport<
    typeof import("../../../../routes/metadata//share/index.js")
  >("../../../../routes/metadata/share/index.js", {
    "../../../../routes/metadata/share/utils/removeFileSharing.js": {
      default: removeFileSharing,
    },
    "../../../../routes/metadata/share/utils/addFileSharing.js": {
      default: addFileSharing,
    },
  });

  const app = await build();

  await app.register(routes as unknown as FastifyPluginCallback, {
    prefix: "/metadata/share",
  });

  await app.ready();
  return app;
};

t.test("metadata/share", async (t) => {
  let app: FastifyInstance;

  t.afterEach(async () => {
    await app.close();
  });

  t.test("create", async (t) => {
    t.test("Should create a file sharing", async (t) => {
      app = await buildApp({
        addFileSharing: () =>
          Promise.resolve({
            rows: [],
          }),
      });

      await app.ready();

      const response = await app.inject({
        method: "POST",
        url: "/metadata/share",
        body: { fileId: "fileId", userId: "userId" },
      });

      t.match(response.json(), {
        data: { fileId: "fileId", userId: "userId" },
      });

      t.equal(response.statusCode, 201);
    });

    t.test(
      "Should throw an error when create file sharing fails",
      async (t) => {
        app = await buildApp({
          addFileSharing: () => Promise.reject("Error"),
        });

        await app.ready();

        const response = await app.inject({
          method: "POST",
          url: "/metadata/share",
          body: { fileId: "fileId", userId: "userId" },
        });

        t.equal(response.statusCode, 500);
      },
    );
  });

  t.test("delete", async (t) => {
    t.test("Should delete a file sharing", async (t) => {
      app = await buildApp({
        removeFileSharing: () =>
          Promise.resolve({
            rows: [],
          }),
      });

      await app.ready();

      const response = await app.inject({
        method: "DELETE",
        url: "/metadata/share",
        body: { fileId: "fileId", userId: "userId" },
      });

      t.equal(response.statusCode, 200);
    });

    t.test(
      "Should throw an error when create file sharing fails",
      async (t) => {
        app = await buildApp({
          removeFileSharing: () => Promise.reject("Error"),
        });

        await app.ready();

        const response = await app.inject({
          method: "DELETE",
          url: "/metadata/share",
          body: { fileId: "fileId", userId: "userId" },
        });

        t.equal(response.statusCode, 500);
      },
    );
  });
});
