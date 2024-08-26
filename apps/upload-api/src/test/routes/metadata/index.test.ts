import { PostgresDb } from "@fastify/postgres";
import { FastifyInstance, FastifyPluginCallback } from "fastify";
import fp from "fastify-plugin";
import { EventEmitter } from "node:events";
import { FieldDef } from "pg";
import { PassThrough } from "stream";
import t from "tap";
import * as authenticationFactory from "../../../utils/authentication-factory.js";

const nextTick = () =>
  new Promise<void>((resolve) => setTimeout(() => resolve()));

t.test("metadata", async (t) => {
  let app: FastifyInstance;

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
            selectUsers: () =>
              new Promise<void>((resolve, reject) => {
                profileSdkEventEmitter.on("done", (data) => resolve(data));
                profileSdkEventEmitter.on("error", (err) => reject(err));
              }),
          }),
      },
    ),
  });

  t.beforeEach(async () => {
    pgEventEmitter = new EventEmitter();
    profileSdkEventEmitter = new EventEmitter();
    app = await build();

    await app.register(routes as unknown as FastifyPluginCallback, {
      prefix: "/metadata",
    });
  });

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

        app
          .inject({
            method: "GET",
            url: "/metadata",
          })
          .then((response) => {
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
            t.end();
          });

        await nextTick();
        pgEventEmitter.emit("done", [
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
        ]);
        await nextTick();
        profileSdkEventEmitter.emit("done", { data: [ownerData], error: null });
        await nextTick();
      },
    );

    t.test(
      "Should return a empty array when no files are available",
      async (t) => {
        app
          .inject({
            method: "GET",
            url: "/metadata",
          })
          .then((response) => {
            t.same(response.json(), { data: [] });

            t.equal(response.statusCode, 200);
            t.end();
          });

        await nextTick();
        // profileSdkEventEmitter.emit('')
        pgEventEmitter.emit("done", []);
        await nextTick();
      },
    );

    t.test("Should throw an error when list files throws", async (t) => {
      app
        .inject({
          method: "GET",
          url: "/metadata",
        })
        .then((response) => {
          t.equal(response.statusCode, 500);
          t.end();
        });

      await nextTick();
      profileSdkEventEmitter.emit("done", { data: [], error: null });
      await nextTick();
      pgEventEmitter.emit("error", new Error("pg error"));
      await nextTick();
    });

    t.test("Should throw an error when profile sdk throws", async (t) => {
      app
        .inject({
          method: "GET",
          url: "/metadata",
        })
        .then((response) => {
          t.equal(response.statusCode, 500);
          t.end();
        });

      await nextTick();
      pgEventEmitter.emit("done", [{ key: "key" }]);
      await nextTick();
      profileSdkEventEmitter.emit("error", new Error("profile sdk error"));
      await nextTick();
    });

    t.test("Should throw an error when profile returns an error", async (t) => {
      app
        .inject({
          method: "GET",
          url: "/metadata",
        })
        .then((response) => {
          t.equal(response.statusCode, 500);
          t.end();
        });

      await nextTick();
      pgEventEmitter.emit("done", [{ key: "key" }]);
      await nextTick();
      profileSdkEventEmitter.emit("done", {
        data: null,
        error: new Error("profile sdk error"),
      });
      await nextTick();
    });
  });
});
