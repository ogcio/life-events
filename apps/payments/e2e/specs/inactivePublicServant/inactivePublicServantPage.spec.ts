import { test } from "../../fixtures/pageFixtures";

import {
  Severity,
  owner,
  tags,
  severity,
  description,
} from "allure-js-commons";
import { InactivePublicServantPage } from "../../objects/inactivePublicSurvant/InactivePublicServantPage";
import { ErrorPage } from "../../objects/errorPage/ErrorPage";

test.describe("Inactive public servant page", () => {
  test.afterAll(async ({ inactivePublicServantPage, request }) => {
    const cookies = await inactivePublicServantPage.context().cookies();
    // console.log(cookies)

    const logtoEndpoint = "http://localhost:3301";
    const tokenEndpoint = `${logtoEndpoint}/oidc/token`;
    const applicationId = "qrtllp45fgbvsdjyasd5";
    const applicationSecret = "XXXXXX";

    const result = await request.post(tokenEndpoint, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${applicationId}:${applicationSecret}`,
        ).toString("base64")}`,
      },
      data: new URLSearchParams({
        grant_type: "client_credentials",
        resource: `https://default.logto.app/api`,
        scope: "all",
      }).toString(),
    });
    const accessToken = (await result.json()).access_token;
    console.log(accessToken);
    const r = await request.get(
      `${logtoEndpoint}/api/users/${"dtndm92rkicd"}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    const userInfo = await r.json();
    console.log(userInfo);
  });

  test("should see a dedicated page for inactive public servants @smoke @normal", async ({
    inactivePublicServantPage,
  }) => {
    await description(
      "This test checks the Inactive Public Servant page's content",
    );
    await owner("OGCIO");
    await tags("Inactive public servant page");
    await severity(Severity.NORMAL);

    await inactivePublicServantPage.goto("/");
    const inactivePubServentPage = new InactivePublicServantPage(
      inactivePublicServantPage,
    );
    await inactivePubServentPage.checPageContent();
  });

  test("should not be able to access any other pages @smoke @normal", async ({
    inactivePublicServantPage,
  }) => {
    await description(
      "This test checks that an inactive public servant cannot access any pages of the application",
    );
    await owner("OGCIO");
    await tags("Inactive public servant page");
    await severity(Severity.NORMAL);

    await inactivePublicServantPage.goto("/en/paymentSetup");
    const page1 = new ErrorPage(inactivePublicServantPage);
    await page1.checPageContent();

    await inactivePublicServantPage.goto("/en/citizen/transactions");
    const page2 = new ErrorPage(inactivePublicServantPage);
    await page2.checPageContent();
  });
});
