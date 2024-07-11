import { test, expect } from "@playwright/test";
import { allure } from "allure-playwright";
import { Severity } from "allure-js-commons";
import { LoginPage } from "../objects/loginPage";

test.describe("Logout Page Tests", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateTo();
  });

  test("should validate successfull end-user logout level 0 @minor", async ({
    page,
  }) => {
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

    const h1Locator = page.locator("h1.govie-heading-l");
    await expect(h1Locator).toBeVisible();

    const logoutButton = page.getByLabel("Logout");
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();

    const mygovidLogo = await page.locator("#mygovid-logo.icon-mygovid_logo");
    await expect(mygovidLogo).toHaveCount(1);
    await expect(mygovidLogo).toBeVisible();
  });

  test("should validate successfull end-user logout level 1 @minor", async ({
    page,
  }) => {
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

    const h1Locator = page.locator("h1.govie-heading-l");
    await expect(h1Locator).toBeVisible();
    await expect(h1Locator).toHaveText("Welcome to Life Events");

    const logoutButton = page.getByLabel("Logout");
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();

    const mygovidLogo = await page.locator("#mygovid-logo.icon-mygovid_logo");
    await expect(mygovidLogo).toHaveCount(1);
    await expect(mygovidLogo).toBeVisible();
  });
});
