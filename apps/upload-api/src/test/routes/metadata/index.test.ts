import { PostgresDb } from "@fastify/postgres";
import { FastifyInstance, FastifyPluginCallback } from "fastify";
import fp from "fastify-plugin";
import t from "tap";
import { CONFIG_TYPE } from "../../../utils/storeConfig.js";
import { getUserFiles } from "../../../routes/metadata/utils/filesMetadata.js";
import { PoolClient } from "pg";

const buildApp = async ({
  getUserFiles,
  getOrganizationFiles,
  getSharedFiles,
  getFileMetadataById,
  getFileSharings,
  getSharedFilesPerOrganization,
  scheduleFileForDeletion,
  removeAllFileSharings,
  userData,
}: {
  userData?: {
    isM2MApplication: boolean;
    userId: string;
    accessToken: string;
    organizationId?: string;
  };
  getUserFiles?: () => Promise<unknown>;
  getOrganizationFiles?: () => Promise<unknown>;
  getSharedFiles?: () => Promise<unknown>;
  getFileMetadataById?: () => Promise<unknown>;
  getFileSharings?: () => Promise<unknown>;
  getSharedFilesPerOrganization?: () => Promise<unknown>;
  scheduleFileForDeletion?: () => Promise<unknown>;
  removeAllFileSharings?: () => Promise<unknown>;
}) => {
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
            request.userData = userData
              ? userData
              : {
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
        SCHEDULER_TOKEN: "SCHEDULER_TOKEN",
      },
      "../../../utils/scheduleCleanupTask.js": {
        default: () => Promise.resolve(),
      },
    },
  );

  const routes = await t.mockImport<
    typeof import("../../../routes/metadata/index.js")
  >("../../../routes/metadata/index.js", {
    "../../../routes/metadata/utils/filesMetadata.js": {
      getUserFiles,
      getOrganizationFiles,
      getSharedFiles,
      getSharedFilesPerOrganization,
      scheduleFileForDeletion,
    },
    "../../../routes/utils/getFileMetadataById.js": {
      default: getFileMetadataById,
    },
    "../../../routes/metadata/utils/getFileSharings.js": {
      default: getFileSharings,
    },
    "../../../routes/metadata/utils/removeAllFileSharings.js": {
      default: removeAllFileSharings,
    },
  });

  const app = await build();

  await app.register(routes as unknown as FastifyPluginCallback, {
    prefix: "/metadata",
  });

  await app.ready();
  return app;
};

t.test("metadata", async (t) => {
  let app: FastifyInstance;

  t.afterEach(async () => {
    await app.close();
  });

  t.test("list", async (t) => {
    t.test("ensureUserCanAccessResource", async (t) => {
      t.test(
        "Public servants should not be able to query other organizations",
        async (t) => {
          app = await buildApp({});
          await app.ready();
          const response = await app.inject({
            method: "GET",
            url: "/metadata",
            query: {
              organizationId: "another-org",
            },
          });
          t.equal(response.statusCode, 403);
        },
      );

      t.test("Citizens should not be able to query other users", async (t) => {
        app = await buildApp({
          userData: {
            accessToken: "",
            isM2MApplication: false,
            userId: "user-id",
          },
        });
        await app.ready();
        const response = await app.inject({
          method: "GET",
          url: "/metadata",
          query: {
            userId: "anotherId",
          },
        });
        t.equal(response.statusCode, 403);
      });

      t.test(
        "Citizens should not be able to query organizations",
        async (t) => {
          app = await buildApp({
            userData: {
              accessToken: "",
              isM2MApplication: false,
              userId: "user-id",
            },
          });
          await app.ready();
          const response = await app.inject({
            method: "GET",
            url: "/metadata",
            query: {
              userId: "user-id",
              organizationId: "orgId",
            },
          });
          t.equal(response.statusCode, 403);
        },
      );
    });

    t.test(
      "Public servants should be able to retrieve all files for the requested user",
      async (t) => {
        app = await buildApp({
          getUserFiles: () =>
            Promise.resolve([
              {
                fileName: "fileName",
                id: "1",
                key: "user/fileName",
                ownerId: "user",
                organizationId: "ogcio",
                fileSize: 100,
                mimeType: "image/png",
                createdAt: "2024-08-12T13:12:18.681Z",
                lastScan: "2024-08-12T13:12:18.681Z",
                deleted: false,
                infected: false,
                infectionDescription: null,
                antivirusDbVersion: "1",
              },
            ]),
        });

        const response = await app.inject({
          method: "GET",
          url: "/metadata",
          query: {
            organizationId: "ogcio",
            userId: "user",
          },
        });

        t.same(response.json().data, [
          {
            fileName: "fileName",
            id: "1",
            key: "user/fileName",
            ownerId: "user",
            fileSize: 100,
            mimeType: "image/png",
            createdAt: "2024-08-12T13:12:18.681Z",
            lastScan: "2024-08-12T13:12:18.681Z",
            deleted: false,
            infected: false,
            infectionDescription: "",
            antivirusDbVersion: "1",
          },
        ]);
      },
    );

    t.test(
      "Public servants should be able to retrieve all files within their org",
      async (t) => {
        app = await buildApp({
          getOrganizationFiles: () =>
            Promise.resolve({
              rows: [
                {
                  fileName: "fileName",
                  id: "1",
                  key: "user/fileName",
                  ownerId: "user",
                  organizationId: "ogcio",
                  fileSize: 100,
                  mimeType: "image/png",
                  createdAt: "2024-08-12T13:12:18.681Z",
                  lastScan: "2024-08-12T13:12:18.681Z",
                  deleted: false,
                  infected: false,
                  infectionDescription: null,
                  antivirusDbVersion: "1",
                },
              ],
            }),
        });

        const response = await app.inject({
          method: "GET",
          url: "/metadata",
          query: {
            organizationId: "ogcio",
          },
        });

        t.same(response.json().data, [
          {
            fileName: "fileName",
            id: "1",
            key: "user/fileName",
            ownerId: "user",
            fileSize: 100,
            mimeType: "image/png",
            createdAt: "2024-08-12T13:12:18.681Z",
            lastScan: "2024-08-12T13:12:18.681Z",
            deleted: false,
            infected: false,
            infectionDescription: "",
            antivirusDbVersion: "1",
          },
        ]);
      },
    );

    t.test(
      "Citizen should be able to retrieve files shared with them",
      async (t) => {
        app = await buildApp({
          userData: {
            accessToken: "",
            isM2MApplication: false,
            userId: "userId",
          },
          getSharedFiles: () =>
            Promise.resolve({
              rows: [
                {
                  fileName: "fileName",
                  id: "1",
                  key: "user/fileName",
                  ownerId: "userId",
                  organizationId: "ogcio",
                  fileSize: 100,
                  mimeType: "image/png",
                  createdAt: "2024-08-12T13:12:18.681Z",
                  lastScan: "2024-08-12T13:12:18.681Z",
                  deleted: false,
                  infected: false,
                  infectionDescription: null,
                  antivirusDbVersion: "1",
                },
              ],
            }),
        });

        const response = await app.inject({
          method: "GET",
          url: "/metadata",
          query: {
            userId: "userId",
          },
        });

        t.equal(response.statusCode, 200);
        t.same(response.json().data, [
          {
            fileName: "fileName",
            id: "1",
            key: "user/fileName",
            ownerId: "userId",
            fileSize: 100,
            mimeType: "image/png",
            createdAt: "2024-08-12T13:12:18.681Z",
            lastScan: "2024-08-12T13:12:18.681Z",
            deleted: false,
            infected: false,
            infectionDescription: "",
            antivirusDbVersion: "1",
          },
        ]);
      },
    );

    t.test("Should throw if a retrieval operation fails", async (t) => {
      app = await buildApp({
        userData: {
          accessToken: "",
          isM2MApplication: false,
          userId: "userId",
        },
        getSharedFiles: () => Promise.reject("Error"),
      });

      const response = await app.inject({
        method: "GET",
        url: "/metadata",
        query: {
          userId: "userId",
        },
      });

      t.equal(response.statusCode, 500);
    });

    t.test(
      "getUserFiles should return files for the requested organization and user",

      async (t) => {
        let counter = 0;

        const client = {
          query: () => {
            if (counter++ === 0) {
              return Promise.resolve({
                rows: [
                  {
                    id: "id-1",
                    ownerId: "userId",
                    organization: "ogcio",
                  },
                ],
              });
            } else {
              return Promise.resolve({
                rows: [
                  {
                    id: "id-2",
                    ownerId: "userId",
                    organization: "ogcio",
                  },
                ],
              });
            }
          },
        };

        const data = await getUserFiles({
          client: client as unknown as PoolClient,
          userId: "userId",
          organizationId: "organizationId",
          toExclude: [],
        });

        t.same(data, [
          { id: "id-1", ownerId: "userId", organization: "ogcio" },
          { id: "id-2", ownerId: "userId", organization: "ogcio" },
        ]);
      },
    );

    t.test(
      "getUserFiles should return files for the requested organization and user with exclusions",

      async (t) => {
        let counter = 0;
        const queryParams: string[] = [];
        const client = {
          query: (...params: string[]) => {
            queryParams.push(...params);
            if (counter++ === 0) {
              return Promise.resolve({
                rows: [
                  {
                    id: "id-1",
                    ownerId: "userId",
                    organization: "ogcio",
                  },
                ],
              });
            } else {
              return Promise.resolve({
                rows: [
                  {
                    id: "id-2",
                    ownerId: "userId",
                    organization: "ogcio",
                  },
                ],
              });
            }
          },
        };

        const data = await getUserFiles({
          client: client as unknown as PoolClient,
          userId: "userId",
          organizationId: "organizationId",
          toExclude: ["id-1"],
        });

        t.same(queryParams[1][2], "id-1");

        t.same(data, [
          { id: "id-1", ownerId: "userId", organization: "ogcio" },
          { id: "id-2", ownerId: "userId", organization: "ogcio" },
        ]);
      },
    );
  });

  t.test("get", async (t) => {
    t.test("Should return file metadata", async (t) => {
      app = await buildApp({
        getFileMetadataById: () =>
          Promise.resolve({
            rows: [
              {
                fileName: "fileName",
                id: "1",
                key: "user/fileName",
                ownerId: "user",
                fileSize: 100,
                mimeType: "image/png",
                createdAt: "2024-08-12T13:12:18.681Z",
                lastScan: "2024-08-12T13:12:18.681Z",
                deleted: false,
                infected: false,
                infectionDescription: null,
                antivirusDbVersion: "1",
              },
            ],
          }),
        getFileSharings: () => Promise.resolve({ rows: [] }),
      });

      const response = await app.inject({
        method: "GET",
        url: "/metadata/1",
      });

      t.match(response.json(), {
        data: {
          fileName: "fileName",
          id: "1",
          key: "user/fileName",
          ownerId: "user",
          fileSize: 100,
          mimeType: "image/png",
          createdAt: "2024-08-12T13:12:18.681Z",
          lastScan: "2024-08-12T13:12:18.681Z",
          deleted: false,
          infected: false,
          infectionDescription: "",
          antivirusDbVersion: "1",
        },
      });

      t.match(response.statusCode, 200);
    });

    t.test(
      "Should thow a 404 error if file metadata is not found",
      async (t) => {
        const ownerData = {
          id: "user",
          firstName: "firstName",
          lastName: "lastName",
          email: "email@gov.ie",
          ppsn: "ppsn",
        };

        app = await buildApp({
          getFileMetadataById: () =>
            Promise.resolve({
              rows: [],
            }),
          getFileSharings: () => Promise.resolve({ rows: [] }),
        });

        const response = await app.inject({
          method: "GET",
          url: "/metadata/1",
        });

        t.equal(response.statusCode, 404);
      },
    );

    t.test("Should thow an error if get metadata throws", async (t) => {
      const ownerData = {
        id: "user",
        firstName: "firstName",
        lastName: "lastName",
        email: "email@gov.ie",
        ppsn: "ppsn",
      };

      app = await buildApp({
        getFileMetadataById: () => Promise.reject("Error"),
        getFileSharings: () => Promise.resolve({ rows: [] }),
      });

      const response = await app.inject({
        method: "GET",
        url: "/metadata/1",
      });

      t.equal(response.statusCode, 500);
    });

    t.test("Should throw an error when profile sdk throws", async (t) => {
      app = await buildApp({
        getFileMetadataById: () => Promise.resolve({ rows: [{ key: "key" }] }),
        getFileSharings: () => Promise.resolve({ rows: [] }),
      });

      const response = await app.inject({
        method: "GET",
        url: "/metadata/1",
      });
      t.equal(response.statusCode, 500);
    });

    t.test("Should throw an error when profile returns an error", async (t) => {
      app = await buildApp({
        getFileMetadataById: () => Promise.resolve({ rows: [{ key: "key" }] }),
        getFileSharings: () => Promise.resolve({ rows: [] }),
      });

      const response = await app.inject({
        method: "GET",
        url: "/metadata/1",
      });
      t.equal(response.statusCode, 500);
    });
  });

  t.test("delete", async (t) => {
    const OriginalDate = Date;

    t.beforeEach(() => {
      Date = class extends Date {
        constructor() {
          super(OriginalDate.UTC(2024, 0, 1, 0, 0, 0));
        }
      };
    });

    t.afterEach(() => {
      Date = OriginalDate;
    });

    t.test(
      "Should schedule a file metadata for deletion and return scheduled file id",
      async (t) => {
        const paramsUsed: string[] = [];

        app = await buildApp({
          getFileMetadataById: () =>
            Promise.resolve({
              rows: [
                {
                  fileName: "fileName",
                  id: "1",
                  key: "user/fileName",
                  ownerId: "user",
                  fileSize: 100,
                  mimeType: "image/png",
                  createdAt: "2024-08-12T13:12:18.681Z",
                  lastScan: "2024-08-12T13:12:18.681Z",
                  deleted: false,
                  infected: false,
                  infectionDescription: null,
                  antivirusDbVersion: "1",
                },
              ],
            }),
          scheduleFileForDeletion: (...params) => {
            paramsUsed.push(...params);
            return Promise.resolve({ rows: [] });
          },
          removeAllFileSharings: () => Promise.resolve(),
        });

        const response = await app.inject({
          method: "DELETE",
          url: "/metadata/",
          body: {
            fileId: "1",
          },
        });

        t.match(response.json(), {
          data: {
            id: "1",
          },
        });

        t.match(response.statusCode, 200);
      },
    );

    t.test(
      "Should throw a bad request error if file id is not provided",
      async (t) => {
        app = await buildApp({
          getFileMetadataById: () =>
            Promise.resolve({
              rows: [],
            }),
        });

        const response = await app.inject({
          method: "DELETE",
          url: "/metadata/",
          body: { fileId: "" },
        });

        t.match(response.statusCode, 400);
      },
    );

    t.test("Should throw a 404 when the metadata is not found", async (t) => {
      app = await buildApp({
        getFileMetadataById: () =>
          Promise.resolve({
            rows: [],
          }),
      });

      const response = await app.inject({
        method: "DELETE",
        url: "/metadata/",
        body: {
          fileId: "1",
        },
      });

      t.match(response.statusCode, 404);
    });

    t.test("Should throw a 500 when a query operation throws", async (t) => {
      app = await buildApp({
        getFileMetadataById: () =>
          Promise.resolve({
            rows: [
              {
                fileName: "fileName",
                id: "1",
                key: "user/fileName",
                ownerId: "user",
                fileSize: 100,
                mimeType: "image/png",
                createdAt: "2024-08-12T13:12:18.681Z",
                lastScan: "2024-08-12T13:12:18.681Z",
                deleted: false,
                infected: false,
                infectionDescription: null,
                antivirusDbVersion: "1",
              },
            ],
          }),
        scheduleFileForDeletion: () => Promise.reject("error"),
      });

      const response = await app.inject({
        method: "DELETE",
        url: "/metadata/",
        body: {
          fileId: "1",
        },
      });

      t.match(response.statusCode, 500);
    });
  });
});
