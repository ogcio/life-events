import { Page } from "@playwright/test";
import { test } from "@playwright/test";

import {
  Severity,
  owner,
  tags,
  severity,
  description,
} from "allure-js-commons";
import { ProvidersPage } from "../../objects/providers/ProvidersPage";
import { MyGovIdMockLoginPage } from "../../objects/MyGovIdMockLoginPage";
import { password, publicServants } from "../../utils/constants";

test.describe("Auth", () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test("should redirect to the requested url after successful login with Public Servant @smoke @critical", async () => {
    await description(
      "This test checks that the user is redirected to the initial requested page after a successful login with Public Servant",
    );
    await owner("OGCIO");
    await tags("Auth", "Login");
    await severity(Severity.CRITICAL);

    const providersPage = new ProvidersPage(page);
    await providersPage.goto();

    const logtoLoginBtn = await page.getByRole("button", {
      name: "Continue with MyGovId",
    });
    await logtoLoginBtn.click();

    const loginPage = new MyGovIdMockLoginPage(page);

    await loginPage.selectUser(publicServants[0], "publicServant");
    await loginPage.enterPassword(password);
    await loginPage.submitLogin(publicServants[0]);

    await providersPage.checkHeader();
  });
});
