import t from "tap";
import addFileSharing from "../../../../../routes/metadata/share/utils/addFileSharing.js";
import { PostgresDb } from "@fastify/postgres";

t.test("addFileSharing", async () => {
  t.test("executes query with correct params", async (t) => {
    const params: string[] = [];
    const pg = { query: (...args: string[]) => params.push(...args) };
    addFileSharing(pg as PostgresDb, "fileId", "userId");
    t.match(params[1], ["fileId", "userId"]);
  });
});
