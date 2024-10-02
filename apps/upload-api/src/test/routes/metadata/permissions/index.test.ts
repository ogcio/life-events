import { PostgresDb } from "@fastify/postgres";
import { FastifyInstance, FastifyPluginCallback } from "fastify";
import fp from "fastify-plugin";
import t from "tap";
import { CONFIG_TYPE, SCHEDULER_TOKEN } from "../../../../utils/storeConfig.js";

const buildApp = async ({
  removeFileSharing,
  addFileSharing,
  getFileSharings,
}: {
  removeFileSharing?: () => Promise<unknown>;
  addFileSharing?: () => Promise<unknown>;
  getFileSharings?: () => Promise<unknown>;
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
              isM2MApplication: false,
              userId: "userId",
              accessToken: "accessToken",
              organizationId: "ogcio",
            };
          });
        }),
      },
      "../../../../utils/storeConfig.js": {
        storeConfig: () => Promise.resolve(),
        CONFIG_TYPE,
        SCHEDULER_TOKEN,
      },
      "../../../../utils/scheduleCleanupTask.js": {
        default: () => Promise.resolve(),
      },
    },
  );

  const routes = await t.mockImport<
    typeof import("../../../../routes/metadata/permissions/index.js")
  >("../../../../routes/metadata/permissions/index.js", {
    "../../../../routes/metadata/permissions/utils/removeFileSharing.js": {
      default: removeFileSharing,
    },
    "../../../../routes/metadata/permissions/utils/addFileSharing.js": {
      default: addFileSharing,
    },
    "../../../../routes/metadata/permissions/utils/getFileSharings.js": {
      default: getFileSharings,
    },
  });

  const app = await build();

  await app.register(routes as unknown as FastifyPluginCallback, {
    prefix: "/metadata/permissions",
  });

  await app.ready();
  return app;
};

t.test("metadata/permissions", async (t) => {
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
        url: "/metadata/permissions",
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
          url: "/metadata/permissions",
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
        url: "/metadata/permissions",
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
          url: "/metadata/permissions",
          body: { fileId: "fileId", userId: "userId" },
        });

        t.equal(response.statusCode, 500);
      },
    );
  });

  t.test("list", async (t) => {
    t.test("Should list file sharings", async (t) => {
      app = await buildApp({
        getFileSharings: () =>
          Promise.resolve({
            rows: [{ fileId: "fileId", userId: "userId" }],
          }),
      });

      await app.ready();

      const response = await app.inject({
        method: "GET",
        url: "/metadata/permissions",
        query: { fileId: "fileId" },
      });

      const body = response.json();

      t.same(body, { data: [{ fileId: "fileId", userId: "userId" }] });

      t.equal(response.statusCode, 200);
    });

    t.test("Should throw an error when get file sharing fails", async (t) => {
      app = await buildApp({
        getFileSharings: () => Promise.reject("Error"),
      });

      await app.ready();

      const response = await app.inject({
        method: "GET",
        url: "/metadata/permissions",
        query: { fileId: "fileId" },
      });

      t.equal(response.statusCode, 500);
    });
  });
});
