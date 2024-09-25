import { S3Client } from "@aws-sdk/client-s3";
import { PostgresDb } from "@fastify/postgres";
import fastify, { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import t, { Test } from "tap";
import { SCHEDULER_TOKEN } from "../../utils/storeConfig.js";

let usedParams: string[] = [];
let markFilesAsDeletedCalled = false;

const buildApp = async (
  t: Test,
  {
    getConfigValue,
    getExpiredFiles,
    s3Send,
    markFilesAsDeleted,
  }: {
    getConfigValue: () => Promise<unknown>;
    getExpiredFiles?: () => Promise<unknown>;
    s3Send?: () => Promise<unknown>;
    markFilesAsDeleted?: () => Promise<unknown>;
  },
) => {
  const app = await fastify();
  await app.register(
    fp(async (fastify) => {
      fastify.decorate("pg", {
        pool: {},
      } as unknown as PostgresDb & Record<string, PostgresDb>);
    }),
  );

  await app.register(
    fp(
      async (fastify) => {
        fastify.decorate("s3Client", {
          config: {
            region: "region",
            endpoint: "",
            forcePathStyle: true,
          },
          bucketName: "",
          client: {
            send: s3Send ? s3Send : () => Promise.resolve({}),
          } as unknown as S3Client,
        });
      },
      { name: "s3ClientPlugin" },
    ),
  );

  const routes = await t.mockImport<
    typeof import("../../routes/schedulerCallback.js")
  >("../../routes/schedulerCallback.js", {
    "../../utils/storeConfig.js": {
      getConfigValue: getConfigValue,
      SCHEDULER_TOKEN,
    },
    "../../utils/scheduleCleanupTask.js": () => Promise.resolve(),
    "../../routes/metadata/utils/filesMetadata.js": {
      getExpiredFiles,
      markFilesAsDeleted: () => {
        markFilesAsDeletedCalled = true;

        return markFilesAsDeleted ? markFilesAsDeleted() : Promise.resolve();
      },
    },
    "@aws-sdk/client-s3": {
      DeleteObjectsCommand: class {
        constructor(...data: string[]) {
          usedParams.push(...data);
        }
      },
    },
  });

  await app.register(
    routes as unknown as (app: FastifyInstance) => Promise<void>,
  );

  return app;
};

t.test("scheduler", async (t) => {
  let app: FastifyInstance;

  const OriginalDate = Date;

  t.beforeEach(() => {
    usedParams = [];
    markFilesAsDeletedCalled = false;
    Date = class extends Date {
      constructor() {
        super(OriginalDate.UTC(2024, 0, 5, 0, 0, 0));
      }
    };
  });

  t.afterEach(() => {
    Date = OriginalDate;
  });

  t.after(async () => {
    await app.close();
  });

  t.test(
    "Should execute scheduled actions when the api is called with the expected token with no action if no files need to be deleted",
    async (t) => {
      app = await buildApp(t, {
        getConfigValue: () => {
          return Promise.resolve("schedulerToken");
        },
        getExpiredFiles: () => Promise.resolve({ rows: [] }),
      });
      await app.ready();

      const res = await app.inject({
        method: "POST",
        url: "/",
        body: {
          token: "schedulerToken",
        },
      });
      t.equal(res.statusCode, 200);
      t.equal(res.headers["content-type"], "application/json; charset=utf-8");
      t.same(res.json(), { status: "ok" });
    },
  );

  t.test(
    "Should execute scheduled actions and delete files scheduled for deletion",
    async (t) => {
      app = await buildApp(t, {
        getConfigValue: () => {
          return Promise.resolve("schedulerToken");
        },
        getExpiredFiles: () =>
          Promise.resolve({
            rows: [
              {
                scheduledDeletionAt: new Date(
                  OriginalDate.UTC(2024, 0, 1, 0, 0, 0),
                ),
                id: "1",
                key: "fileKey",
              },
            ],
          }),
      });
      await app.ready();

      const res = await app.inject({
        method: "POST",
        url: "/",
        body: {
          token: "schedulerToken",
        },
      });

      t.match(
        (
          usedParams[0] as unknown as {
            Delete: { Objects: [{ Key: string }[]] };
          }
        ).Delete.Objects,
        [{ Key: "fileKey" }],
      );

      t.equal(markFilesAsDeletedCalled, true);

      t.equal(res.statusCode, 200);
      t.equal(res.headers["content-type"], "application/json; charset=utf-8");
      t.same(res.json(), { status: "ok" });
    },
  );

  t.test(
    "Should not mark files as deleted when an error in s3 happens",
    async (t) => {
      app = await buildApp(t, {
        getConfigValue: () => {
          return Promise.resolve("schedulerToken");
        },
        getExpiredFiles: () =>
          Promise.resolve({
            rows: [
              {
                scheduledDeletionAt: new Date(
                  OriginalDate.UTC(2024, 0, 1, 0, 0, 0),
                ),
                id: "1",
                key: "fileKey",
              },
            ],
          }),
        s3Send: () =>
          Promise.resolve({
            Errors: [{ Code: "error", Key: "fileKey", id: "1" }],
          }),
      });
      await app.ready();

      const res = await app.inject({
        method: "POST",
        url: "/",
        body: {
          token: "schedulerToken",
        },
      });

      t.match(
        (
          usedParams[0] as unknown as {
            Delete: { Objects: [{ Key: string }[]] };
          }
        ).Delete.Objects,
        [{ Key: "fileKey" }],
      );

      t.equal(markFilesAsDeletedCalled, false);

      t.equal(res.statusCode, 200);
      t.equal(res.headers["content-type"], "application/json; charset=utf-8");
      t.same(res.json(), { status: "ok" });
    },
  );

  t.test(
    "Should not mark files as deleted when an s3 Send throws",
    async (t) => {
      app = await buildApp(t, {
        getConfigValue: () => {
          return Promise.resolve("schedulerToken");
        },
        getExpiredFiles: () =>
          Promise.resolve({
            rows: [
              {
                scheduledDeletionAt: new Date(
                  OriginalDate.UTC(2024, 0, 1, 0, 0, 0),
                ),
                id: "1",
                key: "fileKey",
              },
            ],
          }),
        s3Send: () => Promise.reject("S3 error"),
      });
      await app.ready();

      const res = await app.inject({
        method: "POST",
        url: "/",
        body: {
          token: "schedulerToken",
        },
      });

      t.match(
        (
          usedParams[0] as unknown as {
            Delete: { Objects: [{ Key: string }[]] };
          }
        ).Delete.Objects,
        [{ Key: "fileKey" }],
      );

      t.equal(markFilesAsDeletedCalled, false);

      t.equal(res.statusCode, 200);
      t.equal(res.headers["content-type"], "application/json; charset=utf-8");
      t.same(res.json(), { status: "ok" });
    },
  );

  t.test(
    "Should return a status 200 when markFileAsDeleted throws",
    async (t) => {
      const itemsToDelete: {
        scheduledDeletionAt: Date;
        id: number;
        key: string;
      }[] = [];

      for (let i = 0; i < 101; i++) {
        itemsToDelete.push({
          scheduledDeletionAt: new OriginalDate(
            OriginalDate.UTC(2024, 0, 1, 0, 0, 0),
          ),
          id: i,
          key: "fileKey",
        });
      }

      app = await buildApp(t, {
        getConfigValue: () => {
          return Promise.resolve("schedulerToken");
        },
        getExpiredFiles: () =>
          Promise.resolve({
            rows: itemsToDelete,
          }),
        s3Send: () => Promise.resolve({}),
        markFilesAsDeleted: () => Promise.reject("Dummy error"),
      });
      await app.ready();

      const res = await app.inject({
        method: "POST",
        url: "/",
        body: {
          token: "schedulerToken",
        },
      });

      const deletedObjects = (
        usedParams[0] as unknown as {
          Delete: { Objects: [{ Key: string }[]] };
        }
      ).Delete.Objects;

      t.match(
        deletedObjects,
        itemsToDelete.map((i) => ({ Key: i.key })).slice(0, 100),
      );

      t.equal(deletedObjects.length, 100);
      t.equal(markFilesAsDeletedCalled, true);

      t.equal(res.statusCode, 200);
      t.equal(res.headers["content-type"], "application/json; charset=utf-8");
      t.same(res.json(), { status: "ok" });
    },
  );

  t.test(
    "Should return a positive response when the api is called with an invalid token",
    async (t) => {
      app = await buildApp(t, {
        getConfigValue: () => Promise.resolve("schedulerToken"),
      });
      await app.ready();

      const res = await app.inject({
        method: "POST",
        url: "/",
        body: {
          token: "wrongToken",
        },
      });
      t.equal(res.statusCode, 200);
      t.equal(res.headers["content-type"], "application/json; charset=utf-8");
      t.same(res.json(), { status: "ok" });
    },
  );
});
