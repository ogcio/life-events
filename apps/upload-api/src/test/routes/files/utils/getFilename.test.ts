import t from "tap";
import getFilename from "../../../../routes/files/utils/getFilename.js";
import fastifyPostgres from "@fastify/postgres";

t.test("getFilename", async (t) => {
  t.test(
    "should return the provided filename when there is no clash",
    async (t) => {
      const pg = { query: () => Promise.resolve({ rows: [] }) };

      let value = await getFilename(
        pg as unknown as fastifyPostgres.PostgresDb,
        "filename",
        "userId",
      );

      t.equal(value, "filename");

      value = await getFilename(
        pg as unknown as fastifyPostgres.PostgresDb,
        "filename.txt",
        "userId",
      );

      t.equal(value, "filename.txt");

      value = await getFilename(
        pg as unknown as fastifyPostgres.PostgresDb,
        "filename.prd.txt",
        "userId",
      );

      t.equal(value, "filename.prd.txt");
    },
  );

  t.test(
    "should return the filename with an index when there is a clash",
    async (t) => {
      const pg = {
        query: () => Promise.resolve({ rows: [{ filename: "filename" }] }),
      };

      let value = await getFilename(
        pg as unknown as fastifyPostgres.PostgresDb,
        "filename",
        "userId",
      );

      t.equal(value, "filename-1");

      value = await getFilename(
        pg as unknown as fastifyPostgres.PostgresDb,
        "filename.txt",
        "userId",
      );

      t.equal(value, "filename-1.txt");

      value = await getFilename(
        pg as unknown as fastifyPostgres.PostgresDb,
        "filename.prd.txt",
        "userId",
      );

      t.equal(value, "filename.prd-1.txt");
    },
  );

  t.test(
    "should return the filename with an incremented index if there is a clash with an index",
    async (t) => {
      const pg = {
        query: () => Promise.resolve({ rows: [{ filename: "filename-1" }] }),
      };
      console.log("here");

      let value = await getFilename(
        pg as unknown as fastifyPostgres.PostgresDb,
        "filename",
        "userId",
      );

      t.equal(value, "filename-2");

      value = await getFilename(
        pg as unknown as fastifyPostgres.PostgresDb,
        "filename.txt",
        "userId",
      );

      t.equal(value, "filename-2.txt");

      pg.query = () =>
        Promise.resolve({ rows: [{ filename: "filename.prd-1.txt" }] });
      value = await getFilename(
        pg as unknown as fastifyPostgres.PostgresDb,
        "filename.prd.txt",
        "userId",
      );

      t.equal(value, "filename.prd-2.txt");
    },
  );
});
