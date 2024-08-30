import t from "tap";
import { ensureUserIdIsSet } from "../../utils/authentication-factory.js";

t.test("authentication-factory", async (t) => {
  t.test("getProfileSdk builds profile with citizen token", async (t) => {
    let usedToken = "";
    let profileBackendUrl = "";

    const { getProfileSdk } = await t.mockImport<
      typeof import("../../utils/authentication-factory.js")
    >("../../utils/authentication-factory.js", {
      "api-auth": {
        getAccessToken: (config) => {
          profileBackendUrl = config.resource;
          return "accessToken";
        },
        getOrganizationToken: () => "organizationToken",
      },
      "building-blocks-sdk": {
        Profile: class Profile {
          constructor(params) {
            usedToken = params;
          }
        },
      },
    });
    process.env.PROFILE_BACKEND_URL = "BACKEND_URL/";

    await getProfileSdk();

    t.match(profileBackendUrl, "BACKEND_URL");
    t.match(usedToken, "accessToken");
  });

  t.test(
    "getProfileSdk builds profile with citizen token with trailing slash url",
    async (t) => {
      let usedToken = "";
      let profileBackendUrl = "";

      const { getProfileSdk } = await t.mockImport<
        typeof import("../../utils/authentication-factory.js")
      >("../../utils/authentication-factory.js", {
        "api-auth": {
          getAccessToken: (config) => {
            profileBackendUrl = config.resource;
            return "accessToken";
          },
          getOrganizationToken: () => "organizationToken",
        },
        "building-blocks-sdk": {
          Profile: class Profile {
            constructor(params) {
              usedToken = params;
            }
          },
        },
      });
      process.env.PROFILE_BACKEND_URL = "BACKEND_URL";

      await getProfileSdk();

      t.match(profileBackendUrl, "BACKEND_URL/");
      t.match(usedToken, "accessToken");
    },
  );

  t.test("getProfileSdk builds profile with organization token", async (t) => {
    let usedToken = "";

    const { getProfileSdk } = await t.mockImport<
      typeof import("../../utils/authentication-factory.js")
    >("../../utils/authentication-factory.js", {
      "api-auth": {
        getAccessToken: () => "accessToken",
        getOrganizationToken: () => "organizationToken",
      },
      "building-blocks-sdk": {
        Profile: class Profile {
          constructor(params) {
            usedToken = params;
          }
        },
      },
    });

    await getProfileSdk("organizationId");

    t.match(usedToken, "organizationToken");
  });

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
