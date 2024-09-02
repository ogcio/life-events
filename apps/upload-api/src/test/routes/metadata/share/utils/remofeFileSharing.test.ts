import t from "tap";
import removeFileSharing from "../../../../../routes/metadata/share/utils/removeFileSharing.js";
import { PostgresDb } from "@fastify/postgres";

t.test("removeFileSharing", async () => {
  t.test("executes query with correct params", async (t) => {
    const params: string[] = [];
    const pg = { query: (...args: string[]) => params.push(...args) };
    removeFileSharing(pg as PostgresDb, "fileId", "userId");
    t.match(params[1], ["fileId", "userId"]);
  });
});
