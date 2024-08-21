import t from "tap";
import getFileMetadata from "../../../../routes/files/utils/getFileMetadata.js";
import { FastifyInstance } from "fastify";

t.test("getFileMetdata", async (t) => {
  t.test(
    "Should execute the correct query with no organization id",
    async (t) => {
      const params = ["fileId", "owner"];
      const app = {
        pg: {
          query: (...params) => params,
        },
      };

      const [query, queryParams] = await getFileMetadata(
        app as unknown as FastifyInstance,
        "fileId",
        "owner",
      );

      t.equal(true, query.includes(" AND owner = $2"));
      t.match(params, queryParams);
    },
  );

  t.test("Should execute the correct query with organization id", async (t) => {
    const params = ["fileId", "owner", "organizationId"];
    const app = {
      pg: {
        query: (...params) => params,
      },
    };

    const [query, queryParams] = await getFileMetadata(
      app as unknown as FastifyInstance,
      "fileId",
      "owner",
      "organizationId",
    );

    t.equal(true, query.includes(" AND (owner = $2 OR organization_id = $3)"));
    t.match(params, queryParams);
  });
});
