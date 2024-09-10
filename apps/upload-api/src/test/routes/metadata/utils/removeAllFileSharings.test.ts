import t from "tap";
import { PostgresDb } from "@fastify/postgres";
import removeAllFileSharings from "../../../../routes/metadata/utils/removeAllFileSharings.js";

t.test("removeAllFileSharings", async () => {
  t.test("executes query with correct params", async (t) => {
    const params: string[] = [];
    const pg = { query: (...args: string[]) => params.push(...args) };
    removeAllFileSharings(pg as PostgresDb, "fileId");
    t.match(params[1], ["fileId"]);
  });
});
