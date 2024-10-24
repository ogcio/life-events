import { Page, expect } from "@playwright/test";
import { Texts } from "./mainPageTexts";

export class MainPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async expectWelcomeMessage() {
    const h1Locator = this.page.locator("h1.govie-heading-l");
    await expect(h1Locator).toBeVisible();
    await expect(h1Locator).toHaveText(Texts.welcomeText);
  }

  async expectBanner() {
    const bannerLocator = this.page.locator("div.govie-phase-banner");

    // Check banner visibility
    await expect(bannerLocator).toBeVisible();

    // Check banner content
    const contentLocator = bannerLocator.locator(
      "p.govie-phase-banner__content",
    );
    const contentText = await contentLocator.textContent();

    // Assert full text content
    expect(contentText).toBe(Texts.bannerContent);

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
  }

  async expectCentralTexts() {
    const mainWrapperLocator = this.page.locator(
      "main.govie-main-wrapper.govie-grid-row",
    );

    // H1 assertion
    const welcomeTextLocator = mainWrapperLocator.locator("h1.govie-heading-l");
    await expect(welcomeTextLocator).toBeVisible();
    await expect(welcomeTextLocator).toHaveText(Texts.welcomeText);

    // Paragraph assertions
    const paragraphs = mainWrapperLocator.locator("p.govie-body");
    const firstParagraphText = await paragraphs.nth(0).textContent();
    expect(firstParagraphText).toBe(Texts.firstParagraph);

    const secondParagraphText = await paragraphs.nth(1).textContent();
    expect(secondParagraphText).toContain(Texts.secondParagraph);

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

    const labelLocator = this.page.locator("label.govie-checkboxes__label");
    const labelText = await labelLocator.textContent();
    expect(labelText).toBe(Texts.labelText);

    // Continue button assertion
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

    // Privacy Policy link text assertion
    const privacyPolicyHref = this.page.locator("a >> text=Privacy Policy"); // Using text content
    const privacyPolicyText = await privacyPolicyHref.textContent();
    expect(privacyPolicyText).toBe(Texts.privacyPolicyText);

    // Href attribute assertion
    await expect(privacyPolicyHref).toHaveAttribute(
      "href",
      "https://www.gov.ie/en/help/abd3e-privacy-policy-for-the-government-digital-wallet-app/",
    );
  }

  async clickContinueButton() {
    const continueButtonLocator = this.page.locator("button.govie-button");
    await expect(continueButtonLocator).toBeVisible();
    await continueButtonLocator.click();
  }

  async expectNationalityError() {
    const errorLocator = this.page.locator("#nationality-error");
    await expect(errorLocator).toBeVisible();
    await expect(errorLocator).toHaveText(Texts.nationalityErrorText);
  }
}
