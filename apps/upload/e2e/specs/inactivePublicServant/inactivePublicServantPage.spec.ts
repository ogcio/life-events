import { test } from "../../fixtures/pageFixtures";

import {
  Severity,
  owner,
  tags,
  severity,
  description,
} from "allure-js-commons";
import { ErrorPage } from "../../objects/errorPage/ErrorPage";
import { deleteLogtoUser } from "../../utils/logto_utils";
import { MyGovIdMockLoginPage } from "../../objects/MyGovIdMockLoginPage";
import {
  inactivePublicServant,
  password,
  publicServants,
} from "../../utils/constants";
import { InactivePublicServantPage } from "../../objects/inactivePublicServant/InactivePublicServantPage";
import { expect } from "@playwright/test";

test.describe("Inactive public servant page", () => {
  const baseURL = process.env.BASE_URL || "";

  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ storageState: undefined });
    await page.goto(baseURL);
    const logtoLoginBtn = await page.getByRole("button", {
      name: "Continue with MyGovId",
    });
    await logtoLoginBtn.click();
    const loginPage = new MyGovIdMockLoginPage(page);
    await loginPage.selectUser(inactivePublicServant, "publicServant");
    await loginPage.enterPassword(password);
    await loginPage.submitLogin(inactivePublicServant);
  });

  test("should see a dedicated page for inactive public servants @smoke @normal", async () => {
    await description(
      "This test checks the Inactive Public Servant page's content",
    );
    await owner("OGCIO");
    await tags("Inactive public servant page");
    await severity(Severity.NORMAL);

    await page.goto("/");
    const inactivePubServentPage = new InactivePublicServantPage(page);
    await inactivePubServentPage.checkPageContent();
  });
});
