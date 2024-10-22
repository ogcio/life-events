import t from "tap";
import { Pool, PoolClient } from "pg";
import {
  getOrganizationFiles,
  getSharedFiles,
  getExpiredFiles,
  markFilesAsDeleted,
  scheduleExpiredFilesForDeletion,
  scheduleFileForDeletion,
} from "../../../../routes/metadata/utils/filesMetadata.js";
import { PostgresDb } from "@fastify/postgres";

// Mock the PoolClient query method
class MockPoolClient {
  constructor() {
    this.query = this.query.bind(this);
  }

  async query(queryText: string, params: string[]) {
    // Mock response based on queryText and params
    if (queryText.includes("WHERE owner = $1")) {
      // Mock response for getOwnedFiles
      return {
        rows: [
          {
            id: "1",
            key: "file1.txt",
            ownerId: params[0],
            fileSize: 1234,
            mimeType: "text/plain",
            createdAt: new Date(),
            lastScan: new Date(),
            infected: false,
            infectionDescription: null,
            deleted: false,
            fileName: "file1.txt",
          },
        ],
      };
    } else if (queryText.includes("WHERE organization_id = $1")) {
      // Mock response for getOrganizationFiles
      return {
        rows: [
          {
            id: "2",
            key: "file2.txt",
            ownerId: "user2",
            fileSize: 2345,
            mimeType: "text/plain",
            createdAt: new Date(),
            lastScan: new Date(),
            infected: false,
            infectionDescription: null,
            deleted: false,
            fileName: "file2.txt",
          },
        ],
      };
    }
  }
}

t.test("filesMetadata", async (t) => {
  t.test(
    "getOrganizationFiles should return files for a given organization excluding specified IDs",
    async (t) => {
      const mockClient = new MockPoolClient();
      const organizationId = "org1";
      const toExclude = ["3", "4"];

      const result = await getOrganizationFiles({
        client: mockClient as PoolClient,
        organizationId,
        toExclude,
      });

      t.equal(result.rows.length, 1, "Should return one file");
      t.equal(result.rows[0].id, "2", "File ID should match");
      t.notOk(
        toExclude.includes(result.rows[0].id as string),
        "Should not include excluded IDs",
      );
      t.end();
    },
  );

  t.test(
    "getOrganizationFiles should return files for a given organization without exclusions",
    async (t) => {
      const mockClient = new MockPoolClient();
      const organizationId = "org1";
      const toExclude: string[] = [];

      const result = await getOrganizationFiles({
        client: mockClient as PoolClient,
        organizationId,
        toExclude,
      });

      t.equal(result.rows.length, 1, "Should return one file");
      t.equal(result.rows[0].id, "2", "File ID should match");
      t.end();
    },
  );

  t.test(
    "getSharedFiles should execute a query with userId and no exclusions",
    async (t) => {
      const params: string[] = [];
      const client = { query: (...args: string[]) => params.push(...args) };

      const toExclude: string[] = [];

      getSharedFiles({
        client: client as PoolClient,
        userId: "userId",
        toExclude,
      });

      t.match(params[1], ["userId"]);
    },
  );

  t.test(
    "getSharedFiles should execute a query with userId and ids to exclude",
    async (t) => {
      const params: string[] = [];
      const client = { query: (...args: string[]) => params.push(...args) };

      const toExclude: string[] = ["file-1", "file-2"];

      getSharedFiles({
        client: client as PoolClient,
        userId: "userId",
        toExclude,
      });

      t.match(params[1], ["userId", "file-1", "file-2"]);
    },
  );

  t.test(
    "getExpiredFiles should execute a query with the correct parameters",
    async (t) => {
      const params: string[] = [];
      const pool = { query: (...args: string[]) => params.push(...args) };

      const expirationDate = new Date(Date.UTC(2024, 0, 0, 0, 0, 0));

      getExpiredFiles(pool as Pool, expirationDate);

      t.match(params[1], expirationDate);
    },
  );

  t.test(
    "markFilesAsDeleted should execute a query with the correct parameters",
    async (t) => {
      const params: string[] = [];
      const pool = { query: (...args: string[]) => params.push(...args) };

      const ids = ["id-1", "id-2"];

      markFilesAsDeleted(pool as Pool, ids);

      t.match(params[1], [ids]);
    },
  );

  t.test("Schedule file deletion", async (t) => {
    const OriginalDate = Date;

    t.before(() => {
      Date = class extends Date {
        constructor() {
          super(OriginalDate.UTC(2024, 0, 5, 0, 0, 0));
        }
      };
    });

    t.after(() => {
      Date = OriginalDate;
    });

    t.test(
      "scheduleExpiredFilesForDeletion should execute a query with the correct parameters",
      async (t) => {
        const params: string[] = [];
        const pool = { query: (...args: string[]) => params.push(...args) };

        scheduleExpiredFilesForDeletion(pool as Pool);

        t.equal(
          params[1][0].toString(),
          new OriginalDate(OriginalDate.UTC(2024, 1, 4, 0, 0, 0)).toString(),
        );
      },
    );

    t.test(
      "scheduleFileForDeletion should execute a query with the correct params",
      async (t) => {
        const params: string[] = [];
        const pg = {
          query: (...args: string[]) => params.push(...args),
        };

        scheduleFileForDeletion(pg as PostgresDb, "fileId");
        t.equal(params[1][0], "fileId");
        t.equal(
          params[1][1].toString(),
          new OriginalDate(OriginalDate.UTC(2024, 1, 4, 0, 0, 0)).toString(),
        );
      },
    );
  });
});
