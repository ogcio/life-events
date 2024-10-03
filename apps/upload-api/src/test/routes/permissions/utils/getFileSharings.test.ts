import t from "tap";
import { PostgresDb } from "@fastify/postgres";
import getFileSharings from "../../../../routes/permissions/utils/getFileSharings.js";

t.test("getFileSharings", async () => {
  t.test("executes query with correct params", async (t) => {
    const params: string[] = [];
    const pg = { query: (...args: string[]) => params.push(...args) };
    getFileSharings(pg as PostgresDb, "fileId");
    t.match(params[1], ["fileId"]);
  });
});
