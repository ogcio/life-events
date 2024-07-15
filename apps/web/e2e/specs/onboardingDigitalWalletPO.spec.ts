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

  test("test", async ({ page }) => {
    await page.goto(
      "https://api.dev.blocks.gov.ie/static/login/api/authorize?redirect_uri=https://auth.dev.blocks.gov.ie/auth/callback",
    );
    await loginPage.enterPassword("123");
    await loginPage.clickSubmit();
    await loginPage.expectWelcomeMessage();
    await page.goto("https://dev.life.gov.ie/en/welcome?redirect_url=%2Fen");
    await page.getByLabel("I confirm that I am a public").check();
    await page.getByRole("button", { name: "Continue" }).click();
    await page
      .locator("li")
      .filter({ hasText: "Get your Government Digital" })
      .click();
    await page
      .locator("li")
      .filter({ hasText: "Get your Government Digital" })
      .click();
    await expect(page.getByText("Life EventsGet your")).toBeVisible();
    await page.getByLabel("Get your Government Digital").click();
    await expect(page.getByText("Before you startDuring the")).toBeVisible();
    await expect(page.getByRole("main")).toContainText("Before you start");
    await expect(page.getByRole("main")).toContainText(
      "During the pilot phase, you can only install the Government Digital Wallet on one phone.",
    );
    await page.getByText("Please ensure that you have").click();
    await expect(page.getByRole("main")).toContainText(
      "Please ensure that you have the following ready:",
    );
    await expect(page.locator("ul")).toContainText("Your work email address");
    await page.getByText("The phone that you will use").click();
    await expect(page.locator("ul")).toContainText(
      "The phone that you will use to download the Government Digital Wallet",
    );
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(
      page.getByRole("heading", { name: "About your work" }),
    ).toBeVisible();
    await page.locator("#govIEEmail").click();
    await expect(page.locator("form")).toContainText(
      "Your work email address *",
    );
    await page.locator("#govIEEmail").click();
    await page.locator("#govIEEmail").fill("rodrigo.guimaraes+dev@gmail.com");
    await page.getByRole("button", { name: "Confirm and continue" }).click();
    await expect(
      page.getByRole("heading", { name: "Your device" }),
    ).toBeVisible();
    await expect(page.getByRole("heading")).toContainText("Your device");
    await expect(page.getByRole("main")).toContainText(
      "For the pilot, we need to know the email address linked to your phone. We need this information to ensure that you are added to the correct testing platform.",
    );
    await page.getByText("Please tell us which kind of").click();
    await expect(page.locator("legend")).toContainText(
      "Please tell us which kind of device you are using.",
    );
    await expect(page.getByText("Apple iOS, minimum version")).toBeVisible();
    await expect(page.getByText("Android (eg. Samsung, Google")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Confirm and continue" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Confirm and continue" }).click();
    await expect(page.locator("#device-type-error")).toContainText(
      "Error:Select an option",
    );
    await page.getByLabel("Apple iOS, minimum version").check();
    await page.getByRole("button", { name: "Confirm and continue" }).click();
    await page.getByLabel("Apple App Store email address").click();
    await page
      .getByLabel("Apple App Store email address")
      .fill("rodrigo.guimaraes+dev@gmail.com");
    await expect(
      page.getByRole("heading", { name: "Your device" }),
    ).toBeVisible();
    await expect(page.getByRole("main")).toContainText(
      "This is the email address connected to the phone that will host the pilot app.",
    );
    await expect(page.getByRole("main")).toContainText(
      "To find the email address linked to your device:",
    );
    await page.getByText("Open Settings.").click();
    await expect(page.getByRole("main")).toContainText("Open Settings.");
    await expect(page.getByRole("main")).toContainText(
      "Select the top option (this usually has your username).",
    );
    await expect(page.getByRole("main")).toContainText(
      "Your email address is at the top of this page.",
    );
    await expect(
      page.getByLabel("Apple App Store email address"),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Confirm and continue" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Confirm and continue" }).click();
    await expect(
      page.getByText(
        "HomeDigital Wallet onboardingCheck your detailsCheck your detailsThese details",
      ),
    ).toBeVisible();
    await expect(
      page.locator("div").filter({ hasText: /^Check your details$/ }),
    ).toBeVisible();
    await expect(page.getByText("These details are")).toBeVisible();
    await expect(page.getByText("First name")).toBeVisible();
    await page
      .locator("div")
      .filter({ hasText: "gov.ieLife Events" })
      .first()
      .click();
    await expect(page.getByText("Last name")).toBeVisible();
    await expect(page.getByText("MyGovID email")).toBeVisible();
    await expect(page.getByRole("main")).toContainText("Check your details");
    await expect(page.getByRole("main")).toContainText(
      "These details are automatically populated by your MyGovID account. If this is not you or you have any queries relating to these details please contact support@mygovid.ie",
    );
    await expect(
      page.getByRole("button", { name: "Confirm and continue" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Confirm and continue" }).click();
    await expect(page.getByText("Thank you!")).toBeVisible();
    await expect(page.getByText("We are processing your")).toBeVisible();
    await expect(page.getByText("What happens next?")).toBeVisible();
    await expect(page.getByText("You will receive an email to")).toBeVisible();
    await expect(page.getByRole("main")).toContainText(
      "You will receive an email to the work email address you have provided. You will need to click on the link included in the email, as this verifies that you are a public servant.",
    );
    await expect(page.getByText("Once confirmed, we will use")).toBeVisible();
    await expect(page.getByRole("main")).toContainText(
      "Once confirmed, we will use the email address provided for your device to on-board you to the correct testing platform. You will then receive an email to your MyGovID email address with instructions on how to download the Government Digital Wallet app.",
    );
    await expect(page.getByText("Summary")).toBeVisible();
    await expect(page.getByRole("main")).toContainText("Summary");
    await expect(page.getByText("Application for")).toBeVisible();
    await expect(page.locator("dl")).toContainText("Application for");
    await expect(
      page.getByText("Government Digital Wallet", { exact: true }),
    ).toBeVisible();
    await expect(page.locator("dl")).toContainText("Government Digital Wallet");
    await expect(page.locator("dl")).toContainText("Date of application");
    await expect(
      page.getByRole("button", { name: "Return to Life Events" }),
    ).toBeVisible();
    await expect(page.locator("form")).toContainText("Return to Life Events");
    await page.getByRole("button", { name: "Return to Life Events" }).click();
    await expect(
      page.getByRole("heading", { name: "Your application is currently" }),
    ).toBeVisible();
    await expect(page.getByRole("heading")).toContainText(
      "Your application is currently in a queue",
    );
    await expect(page.locator("body")).toContainText("Life Events");
    await expect(page.locator("body")).toContainText("Life Events");
    await expect(page.getByText("Our team are dealing with")).toBeVisible();
    await expect(page.locator("body")).toContainText(
      "Our team are dealing with requests to join the pilot and will be in touch soon. We appreciate your patience.",
    );
    await page.getByText("Our team are dealing with").click();
    await expect(page.locator("body")).toContainText(
      "Our team are dealing with requests to join the pilot and will be in touch soon. We appreciate your patience.",
    );
    await expect(
      page.getByRole("link", { name: "Your Government Digital" }),
    ).toBeVisible();
    await expect(page.locator("body")).toContainText(
      "Your Government Digital Wallet is being processed",
    );
    await expect(page.getByText("We will notify you when it is")).toBeVisible();
    await expect(page.locator("body")).toContainText(
      "We will notify you when it is ready",
    );
    await expect(
      page
        .locator("li")
        .filter({ hasText: "Your Government Digital" })
        .locator("div")
        .first(),
    ).toBeVisible();
  });
});
