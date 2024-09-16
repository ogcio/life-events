import { test } from "@playwright/test";

import {
  Severity,
  owner,
  tags,
  severity,
  description,
} from "allure-js-commons";
import { FilesPage } from "../../objects/files/FilesPage";
import { password, publicServants } from "../../utils/constants";
import { MyGovIdMockLoginPage } from "../../objects/MyGovIdMockLoginPage";

test.describe("Auth", () => {
  test("should redirect to the requested url after successful login with Public Servant @smoke @critical", async ({
    browser,
  }) => {
    const page = await browser.newPage();
    await description(
      "This test checks that the user is redirected to the initial requested page after a successful login with Public Servant",
    );
    await owner("OGCIO");
    await tags("Auth", "Login");
    await severity(Severity.CRITICAL);

    const filesPage = new FilesPage(page);
    await filesPage.goto();

    const logtoLoginBtn = await page.getByRole("button", {
      name: "Continue with MyGovId",
    });
    await logtoLoginBtn.click();

    const loginPage = new MyGovIdMockLoginPage(page);

    await loginPage.selectUser(publicServants[0], "publicServant");
    await loginPage.enterPassword(password);
    await loginPage.submitLogin(publicServants[0]);

    await filesPage.checkHeader();
  });
});
