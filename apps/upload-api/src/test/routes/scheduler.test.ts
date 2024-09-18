import t from "tap";
import fastify, { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { PostgresDb } from "@fastify/postgres";

const buildApp = async (promiseHandler: () => Promise<unknown>) => {
  const app = await fastify();
  await app.register(
    fp((fastify, opts, done) => {
      fastify.decorate("pg", {
        pool: {
          query: promiseHandler,
        },
      } as unknown as PostgresDb & Record<string, PostgresDb>);

      done();
    }),
  );

  app.register(import("../../routes/scheduler.js"));
  return app;
};

t.test("scheduler", async (t) => {
  let app: FastifyInstance;

  t.after(async () => {
    await app.close();
  });

  t.test(
    "Should execute scheduled actions when the api si called with the expected token",
    async (t) => {
      app = await buildApp(() =>
        Promise.resolve({
          rows: [{ value: "schedulerToken", type: "string" }],
        }),
      );
      await app.ready();

      const res = await app.inject({
        method: "POST",
        url: "/",
        body: {
          schedulerToken: "schedulerToken",
        },
      });
      t.equal(res.statusCode, 200);
      t.equal(res.headers["content-type"], "application/json; charset=utf-8");
      t.same(res.json(), { status: "ok" });
    },
  );

  t.test(
    "Should return a positive response when the api is called with an invalid token",
    async (t) => {
      app = await buildApp(() =>
        Promise.resolve({
          rows: [{ value: "schedulerToken", type: "string" }],
        }),
      );
      await app.ready();

      const res = await app.inject({
        method: "POST",
        url: "/",
        body: {
          schedulerToken: "wrongToken",
        },
      });
      t.equal(res.statusCode, 200);
      t.equal(res.headers["content-type"], "application/json; charset=utf-8");
      t.same(res.json(), { status: "ok" });
    },
  );
});
