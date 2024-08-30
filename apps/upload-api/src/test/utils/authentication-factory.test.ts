import t from "tap";
import { ensureUserIdIsSet } from "../../utils/authentication-factory.js";

t.test("authentication-factory", async (t) => {
  t.test(
    "getSchedulerSdk builds scheduler with organization token",
    async (t) => {
      let usedToken = "";

      const { getSchedulerSdk } = await t.mockImport<
        typeof import("../../utils/authentication-factory.js")
      >("../../utils/authentication-factory.js", {
        "api-auth": {
          getAccessToken: () => "accessToken",
          getOrganizationToken: () => "organizationToken",
        },
        "building-blocks-sdk": {
          Profile: class Profile {
            constructor(params: string) {
              usedToken = params;
            }
          },
          Scheduler: class Scheduler {
            constructor(params: string) {
              usedToken = params;
            }
          },
        },
      });

      await getSchedulerSdk("organizationId");

      t.match(usedToken, "organizationToken");
    },
  );

  t.test("ensureUserIdIsSet returns user id", async (t) => {
    t.match(
      ensureUserIdIsSet({ userData: { userId: "userId" } }, "DUMMY_PROCESS"),
      "userId",
    );
  });

  t.test(
    "ensureUserIdIsSet throws an error if userId is not set",
    async (t) => {
      t.throws(
        () => ensureUserIdIsSet({}, "DUMMY_PROCESS"),
        "User id is not set",
      );
    },
  );
});
