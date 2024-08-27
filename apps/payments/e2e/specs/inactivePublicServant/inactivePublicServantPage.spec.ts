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
