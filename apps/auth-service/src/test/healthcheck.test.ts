import { test } from "node:test";
import assert from "node:assert";
import { build } from "../app.js";

test("healthCheck", async (t) => {
  const app = await build();
  t.after(async () => {
    await app.close();
  });

  const res = await app.inject({
    method: "GET",
    url: "/health",
  });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(
    res.headers["content-type"],
    "application/json; charset=utf-8",
  );
  assert.deepEqual(res.json(), { status: "ok" });
});
