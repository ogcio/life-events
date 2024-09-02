import { PostgresDb } from "@fastify/postgres";
import { FastifyInstance, FastifyPluginCallback } from "fastify";
import fp from "fastify-plugin";
import t from "tap";
import * as authenticationFactory from "../../../utils/authentication-factory.js";

const buildApp = async ({
  profileSdkResponse,
  getOwnedFiles,
  getOrganizationFiles,
  getSharedFiles,
  getFileMetadataById,
  getFileSharings,
}: {
  profileSdkResponse?: () => Promise<unknown>;
  getOwnedFiles?: () => Promise<unknown>;
  getOrganizationFiles?: () => Promise<unknown>;
  getSharedFiles?: () => Promise<unknown>;
  getFileMetadataById?: () => Promise<unknown>;
  getFileSharings?: () => Promise<unknown>;
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
    typeof import("../../../routes/metadata/index.js")
  >("../../../routes/metadata/index.js", {
    "../../../utils/authentication-factory.js": t.createMock(
      authenticationFactory,
      {
        getProfileSdk: () =>
          Promise.resolve({
            selectUsers: () => profileSdkResponse?.(),
          }),
      },
    ),
    "../../../routes/utils/filesMetadata.js": {
      getOwnedFiles,
      getOrganizationFiles,
      getSharedFiles,
    },
    "../../../routes/utils/getFileMetadataById.js": {
      default: getFileMetadataById,
    },
    "../../../routes/utils/getFileSharings.js": { default: getFileSharings },
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
    t.test(
      "Should return a list of all files uploaded by a user",
      async (t) => {
        const ownerData = {
          id: "user",
          firstName: "firstName",
          lastName: "lastName",
          email: "email@gov.ie",
          ppsn: "ppsn",
        };

        app = await buildApp({
          profileSdkResponse: () =>
            Promise.resolve({ data: [ownerData], error: null }),
          getOwnedFiles: () =>
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
          getOrganizationFiles: () =>
            Promise.resolve({
              rows: [],
            }),
          getSharedFiles: () =>
            Promise.resolve({
              rows: [],
            }),
        });

        await app.ready();

        const response = await app.inject({
          method: "GET",
          url: "/metadata",
        });

        t.match(response.json(), {
          data: [
            {
              fileName: "fileName",
              id: "1",
              key: "user/fileName",
              owner: ownerData,
              fileSize: 100,
              mimeType: "image/png",
              createdAt: "2024-08-12T13:12:18.681Z",
              lastScan: "2024-08-12T13:12:18.681Z",
              deleted: false,
              infected: false,
              infectionDescription: "",
              antivirusDbVersion: "1",
            },
          ],
        });

        t.equal(response.statusCode, 200);
      },
    );

    t.test(
      "Should return a list of all files uploaded by a user and within the org",
      async (t) => {
        const ownerData = {
          id: "user",
          firstName: "firstName",
          lastName: "lastName",
          email: "email@gov.ie",
          ppsn: "ppsn",
        };

        app = await buildApp({
          profileSdkResponse: () =>
            Promise.resolve({ data: [ownerData], error: null }),
          getOwnedFiles: () =>
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
          getOrganizationFiles: () =>
            Promise.resolve({
              rows: [
                {
                  fileName: "fileName-1",
                  id: "2",
                  organizationId: "ogcio",
                  key: "user2/fileName",
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
          getSharedFiles: () =>
            Promise.resolve({
              rows: [],
            }),
        });

        const response = await app.inject({
          method: "GET",
          url: "/metadata",
        });

        t.match(response.json(), {
          data: [
            {
              fileName: "fileName",
              id: "1",
              key: "user/fileName",
              owner: ownerData,
              fileSize: 100,
              mimeType: "image/png",
              createdAt: "2024-08-12T13:12:18.681Z",
              lastScan: "2024-08-12T13:12:18.681Z",
              deleted: false,
              infected: false,
              infectionDescription: "",
              antivirusDbVersion: "1",
            },
            {
              fileName: "fileName-1",
              id: "2",
              key: "user2/fileName",
              owner: ownerData,
              fileSize: 100,
              mimeType: "image/png",
              createdAt: "2024-08-12T13:12:18.681Z",
              lastScan: "2024-08-12T13:12:18.681Z",
              deleted: false,
              infected: false,
              infectionDescription: "",
              antivirusDbVersion: "1",
            },
          ],
        });
      },
    );

    t.test(
      "Should return a list of all files shared with the current user",
      async (t) => {
        const ownerData = {
          id: "user",
          firstName: "firstName",
          lastName: "lastName",
          email: "email@gov.ie",
          ppsn: "ppsn",
        };

        app = await buildApp({
          profileSdkResponse: () =>
            Promise.resolve({ data: [ownerData], error: null }),
          getOwnedFiles: () =>
            Promise.resolve({
              rows: [],
            }),
          getOrganizationFiles: () =>
            Promise.resolve({
              rows: [],
            }),
          getSharedFiles: () =>
            Promise.resolve({
              rows: [
                {
                  fileName: "fileName-1",
                  id: "2",
                  organizationId: "ogcio",
                  key: "user2/fileName",
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
        });

        const response = await app.inject({
          method: "GET",
          url: "/metadata",
        });

        t.match(response.json(), {
          data: [
            {
              fileName: "fileName-1",
              id: "2",
              key: "user2/fileName",
              owner: ownerData,
              fileSize: 100,
              mimeType: "image/png",
              createdAt: "2024-08-12T13:12:18.681Z",
              lastScan: "2024-08-12T13:12:18.681Z",
              deleted: false,
              infected: false,
              infectionDescription: "",
              antivirusDbVersion: "1",
            },
          ],
        });
      },
    );

    t.test(
      "Should return a empty array when no files are available",
      async (t) => {
        const ownerData = {
          id: "user",
          firstName: "firstName",
          lastName: "lastName",
          email: "email@gov.ie",
          ppsn: "ppsn",
        };

        app = await buildApp({
          profileSdkResponse: () =>
            Promise.resolve({ data: [ownerData], error: null }),
          getOwnedFiles: () =>
            Promise.resolve({
              rows: [],
            }),
          getOrganizationFiles: () =>
            Promise.resolve({
              rows: [],
            }),
          getSharedFiles: () =>
            Promise.resolve({
              rows: [],
            }),
        });

        const response = await app.inject({
          method: "GET",
          url: "/metadata",
        });

        t.match(response.json(), {
          data: [],
        });
      },
    );

    t.test(
      "Should throw an error when retrieving metadata throws",
      async (t) => {
        const ownerData = {
          id: "user",
          firstName: "firstName",
          lastName: "lastName",
          email: "email@gov.ie",
          ppsn: "ppsn",
        };

        app = await buildApp({
          profileSdkResponse: () =>
            Promise.resolve({ data: [ownerData], error: null }),
          getOwnedFiles: () => Promise.reject("Error"),
          getOrganizationFiles: () =>
            Promise.resolve({
              rows: [],
            }),
          getSharedFiles: () =>
            Promise.resolve({
              rows: [],
            }),
        });

        const response = await app.inject({
          method: "GET",
          url: "/metadata",
        });

        t.match(response.statusCode, 500);
      },
    );

    t.test("Should throw an error when profile sdk throws", async (t) => {
      app = await buildApp({
        profileSdkResponse: () => Promise.reject("Error"),
        getOwnedFiles: () => Promise.resolve({ rows: [{ key: "key" }] }),
        getOrganizationFiles: () =>
          Promise.resolve({
            rows: [],
          }),
        getSharedFiles: () =>
          Promise.resolve({
            rows: [],
          }),
      });

      const response = await app.inject({
        method: "GET",
        url: "/metadata",
      });

      t.match(response.statusCode, 500);
    });

    t.test("Should throw an error when profile returns an error", async (t) => {
      app = await buildApp({
        profileSdkResponse: () =>
          Promise.resolve({
            data: null,
            error: new Error("profile sdk error"),
          }),
        getOwnedFiles: () => Promise.resolve({ rows: [{ key: "key" }] }),
        getOrganizationFiles: () =>
          Promise.resolve({
            rows: [],
          }),
        getSharedFiles: () =>
          Promise.resolve({
            rows: [],
          }),
      });

      const response = await app.inject({
        method: "GET",
        url: "/metadata",
      });

      t.match(response.statusCode, 500);
    });
  });

  t.test("get", async (t) => {
    t.test("Should return file metadata", async (t) => {
      const ownerData = {
        id: "user",
        firstName: "firstName",
        lastName: "lastName",
        email: "email@gov.ie",
        ppsn: "ppsn",
      };

      app = await buildApp({
        profileSdkResponse: () =>
          Promise.resolve({ data: [ownerData], error: null }),
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
          owner: ownerData,
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
          profileSdkResponse: () =>
            Promise.resolve({ data: [ownerData], error: null }),
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
        profileSdkResponse: () =>
          Promise.resolve({ data: [ownerData], error: null }),
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
        profileSdkResponse: () => Promise.reject("Error"),
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
      const ownerData = {
        id: "user",
        firstName: "firstName",
        lastName: "lastName",
        email: "email@gov.ie",
        ppsn: "ppsn",
      };
      app = await buildApp({
        profileSdkResponse: () =>
          Promise.resolve({
            data: [ownerData],
            error: new Error("profile sdk error"),
          }),
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
});
