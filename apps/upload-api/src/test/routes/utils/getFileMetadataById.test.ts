import t from "tap";
import fastifyPostgres from "@fastify/postgres";
import getFileMetadataById from "../../../routes/utils/getFileMetadataById.js";

t.test("getFileMetdata", async (t) => {
  t.test(
    "Should execute the correct query with no organization id",
    async (t) => {
      const params = ["fileId", "owner"];
      const pg = {
        query: (...params: string[]) => params,
      };

      const [query, queryParams] = (await getFileMetadataById(
        pg as fastifyPostgres.PostgresDb,
        "fileId",
        "owner",
      )) as unknown as string[];

      t.equal(true, query.includes(" AND owner = $2"));
      t.match(params, queryParams);
    },
  );

  t.test("Should execute the correct query with organization id", async (t) => {
    const params = ["fileId", "owner", "organizationId"];
    const pg = {
      query: (...params: string[]) => params,
    };

    const [query, queryParams] = (await getFileMetadataById(
      pg as fastifyPostgres.PostgresDb,
      "fileId",
      "owner",
      "organizationId",
    )) as unknown as string[];

    t.equal(true, query.includes(" AND (owner = $2 OR organization_id = $3)"));
    t.match(params, queryParams);
  });
});
