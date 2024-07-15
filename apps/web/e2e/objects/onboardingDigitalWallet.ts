import { Page, expect } from "@playwright/test";
import { ONBOARDING_TEXTS } from "./onboardingTexts";

export class OnboardingDigitalWalletPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateToLoginPage() {
    await this.page.goto(
      "https://api.dev.blocks.gov.ie/static/login/api/authorize?redirect_uri=https://auth.dev.blocks.gov.ie/auth/callback",
    );
  }

  async navigateToWelcomePage() {
    await this.page.goto(
      "https://dev.life.gov.ie/en/welcome?redirect_url=%2Fen",
    );
  }

  async confirmPublicServantStatus() {
    await this.page.getByLabel("I confirm that I am a public").check();
  }

  async clickContinueButton() {
    await this.page.getByRole("button", { name: "Continue" }).click();
  }

  async clickGetGovernmentDigital() {
    await this.page
      .locator("li")
      .filter({ hasText: "Get your Government Digital" })
      .click();
  }

  async expectWelcomeMessage() {
    await expect(this.page.getByText("Life EventsGet your")).toBeVisible();
  }

  async clickAppleIOSOption() {
    await this.page.getByLabel("Apple iOS, minimum version").check();
  }

  async fillEmailAddress(email: string) {
    await this.page.getByLabel("Apple App Store email address").fill(email);
  }

  async expectHeading(heading: string) {
    await expect(
      this.page.getByRole("heading", { name: heading }),
    ).toBeVisible();
  }

  async expectErrorMessage() {
    await expect(this.page.locator("#device-type-error")).toContainText(
      ONBOARDING_TEXTS.selectOptionError,
    );
  }

  async confirmAndContinue() {
    await this.page
      .getByRole("button", { name: "Confirm and continue" })
      .click();
  }

  async returnToLifeEvents() {
    await this.page
      .getByRole("button", { name: "Return to Life Events" })
      .click();
  }

  async expectTextInBody(text: string) {
    await expect(this.page.locator("body")).toContainText(text);
  }
}
