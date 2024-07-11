import { test, expect } from "@playwright/test";
import { allure } from "allure-playwright";
import { Severity } from "allure-js-commons";
import { LoginPage } from "../objects/loginPage";

test.describe("Main Page Tests", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateTo();
  });

  test("should validate successfull main page header texts and links", async ({
    page,
  }) => {
    await allure.description(
      "This test attempts to logout from the life events application",
    );
    await allure.owner("OGCIO");
    await allure.tags("Login", "Essentials", "Authentication");
    await allure.severity(Severity.NORMAL);

    await loginPage.enterPassword("123");
    await loginPage.clickSubmit();

    const h1Locator = page.locator("h1.govie-heading-l");
    await expect(h1Locator).toBeVisible();

    const bannerLocator = page.locator("div.govie-phase-banner");

    // Check banner visibility (optional)
    await expect(bannerLocator).toBeVisible();

    // Check banner content
    const contentLocator = bannerLocator.locator(
      "p.govie-phase-banner__content",
    );
    const contentText = await contentLocator.textContent();

    // Assert full text content
    expect(contentText).toBe(
      "AlphaThis is a new service - your feedback will help us improve it. If you're having problems submit a support request",
    );

    // Find and check feedback link
    const feedbackLinkLocator = contentLocator.locator(
      "a.govie-link >> text=feedback",
    );
    await expect(feedbackLinkLocator).toBeVisible();
    await expect(feedbackLinkLocator).toHaveAttribute(
      "href",
      "https://www.forms.gov.ie/en/6669869c2fe1ff00242a1547",
    );

    // Find and check support link
    const supportLinkLocator = contentLocator.locator(
      "a.govie-link >> text=support",
    );
    await expect(supportLinkLocator).toBeVisible();
    await expect(supportLinkLocator).toHaveAttribute(
      "href",
      "https://www.forms.gov.ie/en/6663287aff870300248b6232",
    );
  });

  test.only("should validate successfull main page central texts and links", async ({
    page,
  }) => {
    await allure.description(
      "This test attempts to logout from the life events application",
    );
    await allure.owner("OGCIO");
    await allure.tags("Login", "Essentials", "Authentication");
    await allure.severity(Severity.NORMAL);

    await loginPage.enterPassword("123");
    await loginPage.clickSubmit();

    const h1Locator = page.locator("h1.govie-heading-l");
    await expect(h1Locator).toBeVisible();

    const mainWrapperLocator = page.locator(
      "main.govie-main-wrapper.govie-grid-row",
    );

    // H1 assertion
    const welcomeTextLocator = mainWrapperLocator.locator("h1.govie-heading-l");
    await expect(welcomeTextLocator).toBeVisible();
    await expect(welcomeTextLocator).toHaveText("Welcome to Life Events");

    // // Paragraph assertions
    const paragraphs = mainWrapperLocator.locator("p.govie-body");
    const firstParagraphText = await paragraphs.nth(0).textContent();
    expect(firstParagraphText).toBe(
      "The Government Digital Wallet pilot is open to public servants only.",
    );

    const secondParagraphText = await paragraphs.nth(1).textContent();
    expect(secondParagraphText).toContain(
      "Before you can download the Government Digital Wallet, we need your work email address to verify that you are a public servant and we will need your device app store email to ensure you are added to the correct testing platform. By participating in the pilot, you consent to the collection and storage of this data. This data will be used solely for the purpose of managing and improving the pilot. All of your data is handled in compliance with GDPR and data protection law. For additional information on how we handle your data, please refer to our Privacy Policy.",
    );

    // Privacy Policy link assertion
    const privacyPolicyLinkLocator = paragraphs.nth(1).locator("a");
    await expect(privacyPolicyLinkLocator).toBeVisible();
    await expect(privacyPolicyLinkLocator).toHaveAttribute(
      "href",
      "https://www.gov.ie/en/help/abd3e-privacy-policy-for-the-government-digital-wallet-app/",
    );

    // Checkbox assertion
    const checkboxLocator = mainWrapperLocator.locator('input[id="consent"]');
    await expect(checkboxLocator).toBeVisible();

    const labelLocator = page.locator("label.govie-checkboxes__label");
    const labelText = await labelLocator.textContent();

    expect(labelText).toBe(
      "I confirm that I am a public servant and I consent to be a participant in the Government Digital Wallet pilot. I understand that I can withdraw from the pilot at any time",
    );

    // Continue button assertion (optional)
    const continueButtonLocator = mainWrapperLocator.locator(
      "button.govie-button",
    );
    const hasContinueButton = (await continueButtonLocator.count()) > 0;

    if (hasContinueButton) {
      await expect(continueButtonLocator).toBeVisible();
      await expect(continueButtonLocator).toHaveText("Continue");
    } else {
      console.log("Continue button not found");
    }

    const privacyPolicyHref = page.locator("a >> text=Privacy Policy"); // Using text content

    // Text content assertion
    const privacyPolicyText = await privacyPolicyHref.textContent();
    expect(privacyPolicyText).toBe("Privacy Policy");

    // Href attribute assertion
    await expect(privacyPolicyHref).toHaveAttribute(
      "href",
      "https://www.gov.ie/en/help/abd3e-privacy-policy-for-the-government-digital-wallet-app/",
    );
  });
});
