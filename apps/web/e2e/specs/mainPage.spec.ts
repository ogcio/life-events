import { test, expect } from "@playwright/test";
import { allure } from "allure-playwright";
import { Severity } from "allure-js-commons";
import { LoginPage } from "../objects/loginPage";
import { MainPage } from "../objects/mainPage";

test.describe("Main Page Tests", () => {
  let loginPage: LoginPage;
  let mainPage: MainPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    mainPage = new MainPage(page);
    await loginPage.navigateTo();
  });

  test("should validate successful main page header texts and links", async () => {
    await allure.description(
      "This test attempts to validate the main page header texts and links.",
    );
    await allure.owner("OGCIO");
    await allure.tags("Main Page", "Essentials", "Content");
    await allure.severity(Severity.NORMAL);

    await loginPage.enterPassword("123");
    await loginPage.clickSubmit();

    await mainPage.expectWelcomeMessage();
    await mainPage.expectBanner();
  });

  test("should validate successful main page central texts and links", async () => {
    await allure.description(
      "This test attempts to validate the main page central texts and links.",
    );
    await allure.owner("OGCIO");
    await allure.tags("Main Page", "Essentials", "Content");
    await allure.severity(Severity.NORMAL);

    await loginPage.enterPassword("123");
    await loginPage.clickSubmit();

    await mainPage.expectCentralTexts();
  });
});
