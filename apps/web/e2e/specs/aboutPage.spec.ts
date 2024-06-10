import { test, expect } from "@playwright/test";
import { LoginPage } from "../objects/loginPage";
import { AboutPage } from "../objects/aboutPage";

test.describe("About Page Tests", () => {
  let loginPage: LoginPage;
  let aboutPage: AboutPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    aboutPage = new AboutPage(page);

    // Navigate to login page and perform login
    await loginPage.navigateTo();
    await loginPage.enterPassword("123");
    await loginPage.clickSubmit();
  });

  test("should navigate to the about page @critical", async ({ page }) => {
    // Navigate to the home page and then to the about page
    await aboutPage.navigateTo();
    await aboutPage.clickAboutPage();

    // Validate URL and heading
    await aboutPage.expectUrl();
    await aboutPage.expectHeading();
  });

  test("should verify that About me exists @normal", async ({ page }) => {
    // Navigate to the authentication page and login
    await aboutPage.navigateToAuth();
    await aboutPage.fillTextbox("123");
    await loginPage.clickSubmit();

    // Navigate to the welcome page and click the events menu
    await aboutPage.navigateToWelcome();
    await aboutPage.clickEventsMenu();

    // Validate that 'About me' exists in the list
    await aboutPage.expectAboutMeInList();
  });
});
