import tap from "tap";
import { PoolClient } from "pg";
import {
  getOrganizationFiles,
  getOwnedFiles,
} from "../../../routes/utils/filesMetadata.js";

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

// tap.test("getOwnedFiles should return files for a given owner", async (t) => {
//   const mockClient = new MockPoolClient();
//   const ownerId = "user1";

//   const result = await getOwnedFiles(mockClient as PoolClient, ownerId);

//   t.equal(result.rows.length, 1, "Should return one file");
//   t.equal(result.rows[0].ownerId, ownerId, "Owner ID should match");
//   t.equal(result.rows[0].key, "file1.txt", "File key should match");
//   t.end();
// });

// tap.test(
//   "getOrganizationFiles should return files for a given organization excluding specified IDs",
//   async (t) => {
//     const mockClient = new MockPoolClient();
//     const organizationId = "org1";
//     const toExclude = ["3", "4"];

//     const result = await getOrganizationFiles(
//       mockClient as PoolClient,
//       organizationId,
//       toExclude,
//     );

//     t.equal(result.rows.length, 1, "Should return one file");
//     t.equal(result.rows[0].id, "2", "File ID should match");
//     t.notOk(
//       toExclude.includes(result.rows[0].id),
//       "Should not include excluded IDs",
//     );
//     t.end();
//   },
// );

// tap.test(
//   "getOrganizationFiles should return files for a given organization without exclusions",
//   async (t) => {
//     const mockClient = new MockPoolClient();
//     const organizationId = "org1";
//     const toExclude = [];

//     const result = await getOrganizationFiles(
//       mockClient,
//       organizationId,
//       toExclude,
//     );

//     t.equal(result.rows.length, 1, "Should return one file");
//     t.equal(result.rows[0].id, "2", "File ID should match");
//     t.end();
//   },
// );