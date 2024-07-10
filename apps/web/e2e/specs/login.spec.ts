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

  // test.only("should navigate to the about page @blocker", async ({ page }) => {
  //   await allure.severity(Severity.BLOCKER);
  //   await allure.description(
  //     "This test attempts to log into the website using a login and a password. Fails if any error happens.\n\nNote that this test does not test 2-Factor Authentication.",
  //   );
  //   await loginPage.clickPublicServant();
  //   await loginPage.expectTitle("MyGovID - Login");
  //   //await loginPage.expectPublicServantText();
  //   await loginPage.enterPassword("123");
  //   await loginPage.clickSubmit();
  // });

  test("should validate the password is required for and end user @critical", async ({
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
  });

  test("should validate the password is required for Public Servant @critical", async ({
    page,
  }) => {
    await allure.description(
      "This test attempts to log into the website using a login and an empty password for a Public Servant.",
    );
    await allure.owner("OGCIO");
    await allure.tags("Login", "Essentials", "Authentication");
    await allure.severity(Severity.CRITICAL);

    await loginPage.clickPublicServant();
    await loginPage.expectPublicServantText();

    await loginPage.clickSubmit();
    await loginPage.expectPasswordRequired();
  });

  test("should validate main Login Page elements @critical", async ({
    page,
  }) => {
    await allure.description(
      "This test attempts to log into the website using a login and an empty password for a Public Servant.",
    );
    await allure.owner("OGCIO");
    await allure.tags("Login", "Essentials", "Authentication");
    await allure.severity(Severity.CRITICAL);

    const mygovidLogo = await page.locator("#mygovid-logo.icon-mygovid_logo");
    await expect(mygovidLogo).toHaveCount(1);
    await expect(mygovidLogo).toBeVisible();
    await expect(
      page.locator('div[style="display: flex; flex-direction: column"]'),
    ).toBeVisible();
    await expect(page.locator("label >> text=Public Servant")).toBeVisible();
    await expect(page.locator("label >> text=Public Servant")).toContainText(
      "Public Servant",
    );
    await expect(
      page.locator("label >> text=Verification level"),
    ).toBeVisible();
    await expect(
      page.locator("label >> text=Verification level"),
    ).toContainText("Verification level");

    const userSelectLabel = await page.locator(
      'div.password-label label[for="user_select"]',
    );
    await expect(userSelectLabel).toBeVisible();
    await expect(userSelectLabel).toHaveText("Select user");

    const passwordLabel = await page.locator('label[for="password"]');
    await expect(passwordLabel).toBeVisible();
    await expect(passwordLabel).toHaveText("Password");

    const loginButton = await page.locator("#submit_btn");
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toHaveAttribute("id", "submit_btn");
    await expect(loginButton).toHaveAttribute("type", "submit");
    const buttonText = await loginButton.textContent();
    expect(buttonText).toContain("Login");

    const verificationLevelDropdown = await page.locator(
      'select[name="verificationLevel"]',
    );

    await expect(verificationLevelDropdown).toBeVisible();

    const options = await verificationLevelDropdown.locator("option");

    await expect(options).toHaveCount(3);

    for (let i = 0; i < 3; i++) {
      const option = await options.nth(i);
      const optionText = await option.textContent();
      const optionValue = await option.getAttribute("value");

      switch (i) {
        case 0:
          expect(optionText).toBe("Level 0");
          expect(optionValue).toBe("0");
          break;
        case 1:
          expect(optionText).toBe("Level 1");
          expect(optionValue).toBe("1");
          break;
        case 2:
          expect(optionText).toBe("Level 2");
          expect(optionValue).toBe("2");
          break;
      }
    }
  });

  test("should validate successfull end-user login level 0 @critical", async ({
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
  });

  test.only("should validate successfull end-user login level 1 @critical", async ({
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
  });
});
