import { test, expect } from "@playwright/test";
import { allure } from "allure-playwright";
import { Severity } from "allure-js-commons";
import { LoginPage } from "../objects/loginPage";

test.describe("Login Page Tests", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateTo();
  });

  test.only("should navigate to the about page @blocker", async ({ page }) => {
    await allure.severity(Severity.BLOCKER);
    await loginPage.clickPublicServant();
    await loginPage.expectTitle("MyGovID - Login");
    //await loginPage.expectPublicServantText();
    await loginPage.enterPassword("123");
    await loginPage.clickSubmit();
  });

  test("should validate password is required @critical", async ({ page }) => {
    await allure.description(
      "This test attempts to log into the website using a login and a password. Fails if any error happens.\n\nNote that this test does not test 2-Factor Authentication.",
    );
    await allure.owner("John Doe");
    await allure.tags("NewUI", "Essentials", "Authentication");
    await allure.severity(Severity.CRITICAL);
    await allure.link("https://example.com/docs", "Related Documentation");
    await allure.issue("AUTH-123", "https://example.com/issues/AUTH-123");
    await allure.tms("TMS-456", "https://example.com/tms/TMS-456");

    await loginPage.clickSubmit();
    await loginPage.expectPasswordRequired();
  });
});
