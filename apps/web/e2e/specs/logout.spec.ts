import { test, expect } from "@playwright/test";
import { allure } from "allure-playwright";
import { Severity } from "allure-js-commons";
import { LoginPage } from "../objects/loginPage";
import { LogoutPage } from "../objects/logoutPage";

test.describe("Logout Tests", () => {
  let loginPage: LoginPage;
  let logoutPage: LogoutPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    logoutPage = new LogoutPage(page);
    await loginPage.navigateTo();
  });

  test("should validate successful end-user logout level 0 @smoke @critical", async () => {
    await allure.description(
      "This test attempts to logout from the life events application",
    );
    await allure.owner("OGCIO");
    await allure.tags("Login", "Essentials", "Authentication");
    await allure.severity(Severity.CRITICAL);

    await loginPage.clickSubmit();
    await loginPage.expectPasswordRequired();

    await loginPage.enterPassword("123");
    await loginPage.clickSubmit();

    await loginPage.expectWelcomeMessage();

    await logoutPage.clickLogout();
    await logoutPage.expectMyGovIdLogo();
  });

  test("should validate successful end-user logout level 1 @smoke @critical", async () => {
    await allure.description(
      "This test attempts to log into the website using a login and an empty password.",
    );
    await allure.owner("OGCIO");
    await allure.tags("Login", "Essentials", "Authentication");
    await allure.severity(Severity.CRITICAL);

    await loginPage.clickSubmit();
    await loginPage.expectPasswordRequired();

    await loginPage.enterPassword("123");
    await loginPage.clickSubmit();

    await loginPage.expectWelcomeMessage();

    await logoutPage.clickLogout();
    await logoutPage.expectMyGovIdLogo();
  });
});
