import { test, expect } from "@playwright/test";
import { allure } from "allure-playwright";
import { Severity } from "allure-js-commons";
import { LoginPage } from "../objects/loginPage";

test.describe("Login Tests", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateTo();
  });

  test("should validate the password is required for and end user @smoke @normal", async () => {
    await allure.description(
      "This test attempts to log into the website using a login and an empty password.",
    );
    await allure.owner("OGCIO");
    await allure.tags("Login", "Essentials", "Authentication");
    await allure.severity(Severity.NORMAL);

    await loginPage.clickSubmit();
    await loginPage.expectPasswordRequired();
  });

  test("should validate the password is required for Public Servant @smoke @normal", async () => {
    await allure.description(
      "This test attempts to log into the website using a login and an empty password for a Public Servant.",
    );
    await allure.owner("OGCIO");
    await allure.tags("Login", "Essentials", "Authentication");
    await allure.severity(Severity.NORMAL);

    await loginPage.clickPublicServant();
    await loginPage.expectPublicServantText();

    await loginPage.clickSubmit();
    await loginPage.expectPasswordRequired();
  });

  test("should validate main Login Page elements @smoke @critical", async () => {
    await allure.description(
      "This test validates the main elements on the login page.",
    );
    await allure.owner("OGCIO");
    await allure.tags("Login", "Essentials", "Authentication");
    await allure.severity(Severity.CRITICAL);

    await loginPage.expectMyGovIdLogo();
    await loginPage.expectMainElements();
    await loginPage.expectVerificationLevelOptions();
  });

  test("should validate successful end-user login level 0 @smoke @blocker", async () => {
    await allure.description(
      "This test attempts to log into the website using a login and password.",
    );
    await allure.owner("OGCIO");
    await allure.tags("Login", "Essentials", "Authentication");
    await allure.severity(Severity.BLOCKER);

    await loginPage.enterPassword("123");
    await loginPage.clickSubmit();

    await loginPage.expectWelcomeMessage();
  });

  test("should validate successful end-user login level 1 @smoke @blocker", async () => {
    await allure.description(
      "This test attempts to log into the website using a login and password.",
    );
    await allure.owner("OGCIO");
    await allure.tags("Login", "Essentials", "Authentication");
    await allure.severity(Severity.BLOCKER);

    await loginPage.enterPassword("123");
    await loginPage.clickSubmit();

    await loginPage.expectWelcomeMessage();
  });
});
