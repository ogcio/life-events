import t from "tap";
import { build } from "../../app.js";

t.test("healthCheck", async (t) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const app = await build();
  t.after(async () => {
    await app.close();
  });

  const res = await app.inject({
    method: "GET",
    url: "/health",
  });

  t.equal(res.statusCode, 200);
  t.equal(res.headers["content-type"], "application/json; charset=utf-8");
  t.end();
});
