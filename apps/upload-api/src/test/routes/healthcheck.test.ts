import t from "tap";
import fastify from "fastify";

t.test("healthCheck", async (t) => {
  const app = await fastify();
  app.register(import("../../routes/healthcheck.js"));

  t.after(async () => {
    await app.close();
  });

  const res = await app.inject({
    method: "GET",
    url: "/health",
  });
  t.equal(res.statusCode, 200);
  t.equal(res.headers["content-type"], "application/json; charset=utf-8");
  t.same(res.json(), { status: "ok" });
  t.end();
});
