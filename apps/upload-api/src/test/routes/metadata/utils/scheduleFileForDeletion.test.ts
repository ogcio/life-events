import t from "tap";
import { PostgresDb } from "@fastify/postgres";
import scheduleFileForDeletion from "../../../../routes/metadata/utils/scheduleFileForDeletion.js";

t.test("scheduleFileForDeletion", async () => {
  t.test("executes query with correct params", async (t) => {
    const params: string[] = [];
    const pg = { query: (...args: string[]) => params.push(...args) };
    const date = new Date();
    scheduleFileForDeletion(pg as PostgresDb, "fileId", date);
    t.match(params[1], ["fileId", date]);
  });
});
