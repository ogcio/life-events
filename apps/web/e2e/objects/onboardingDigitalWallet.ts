import { Page, expect } from "@playwright/test";

export class OnboardingPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateToOnboarding() {
    await this.page.goto(
      "https://api.dev.blocks.gov.ie/static/login/api/authorize?redirect_uri=https://auth.dev.blocks.gov.ie/auth/callback",
    );
  }

  async fillPassword(password: string) {
    await this.page.getByRole("textbox").click();
    await this.page.getByRole("textbox").fill(password);
  }

  async clickContinue() {
    await this.page.getByRole("button", { name: "Continue" }).click();
  }

  async clickContinueEmail() {
    await this.page
      .getByRole("button", { name: "Confirm and continue" })
      .click();
  }

  async checkPublicServantCheckbox() {
    await this.page.getByLabel("I confirm that I am a public").check();
  }

  async fillEmail(email: string) {
    await this.page.locator("#govIEEmail").click();
    await this.page.locator("#govIEEmail").fill(email);
  }

  async fillGooglePlayStoreEmail(email: string) {
    await this.page.getByLabel("Google Play Store email *").click();
    await this.page.getByLabel("Google Play Store email *").fill(email);
  }

  async selectDeviceOption(device: string) {
    await this.page.getByLabel(device).check();
  }

  async clickReturnToLifeEvents() {
    await this.page
      .getByRole("button", { name: "Return to Life Events" })
      .click();
  }

  async expectWelcomeMessage() {
    await expect(this.page.getByRole("heading")).toContainText(
      "Welcome to Life Events",
    );
  }

  async expectPublicServantConsentText() {
    await expect(this.page.getByRole("group")).toContainText(
      "I confirm that I am a public servant and I consent to be a participant in the Government Digital Wallet pilot. I understand that I can withdraw from the pilot at any time",
    );
  }

  async expectContinueError() {
    await expect(this.page.locator("#nationality-error")).toContainText(
      "Error: You must agree to continue",
    );
  }

  async expectLifeEventsText() {
    await expect(this.page.locator("body")).toContainText("Life Events");
    await expect(this.page.locator("body")).toContainText("Open Events");
    await expect(
      this.page.locator("section").filter({ hasText: "Open Events" }),
    ).toBeVisible();
  }

  async expectDigitalWalletText() {
    await expect(this.page.locator("body")).toContainText(
      "Get your Government Digital Wallet",
    );
    await expect(this.page.locator("body")).toContainText(
      "Start your application",
    );
    await expect(
      this.page.getByLabel("Get your Government Digital"),
    ).toBeVisible();
  }

  async clickGetDigitalWallet() {
    await this.page.getByLabel("Get your Government Digital").click();
  }

  async expectBeforeYouStartText() {
    await expect(this.page.getByRole("main")).toContainText(
      "HomeDigital Wallet onboardingBefore you start",
    );
    await expect(this.page.getByRole("main")).toContainText("Before you start");
  }

  async expectWorkEmailError() {
    await expect(this.page.locator("#input-field-error")).toContainText(
      "Error:Enter an email",
    );
  }

  async expectEmptyWorkEmail() {
    await expect(this.page.locator("#govIEEmail")).toBeEmpty();
  }

  async expectDeviceTypeError() {
    await expect(this.page.locator("#device-type-error")).toContainText(
      "Error:Select an option",
    );
  }

  async expectDeviceOptionsText() {
    await expect(this.page.locator("form")).toContainText(
      "Apple iOS, minimum version 13.4",
    );
    await expect(this.page.locator("form")).toContainText(
      "Android (eg. Samsung, Google, Huawei, Xiaomi, LG), minimum version 6.0",
    );
  }

  async expectCheckYourDetailsText() {
    await expect(this.page.getByRole("main")).toContainText(
      "Check your details",
    );
    await expect(this.page.getByRole("main")).toContainText(
      "These details are automatically populated by your MyGovID account. If this is not you or you have any queries relating to these details please contact support@mygovid.ie",
    );
  }

  async expectApplicationSuccessfulText() {
    await expect(this.page.getByRole("main")).toContainText(
      "Application successful",
    );
  }

  async expectThankYouText() {
    await expect(this.page.getByRole("main")).toContainText("Thank you!");
  }

  async expectWhatHappensNextText() {
    await expect(this.page.getByRole("main")).toContainText(
      "What happens next?",
    );
  }

  async expectDigitalWalletProcessingText() {
    await expect(this.page.locator("body")).toContainText(
      "Your Government Digital Wallet is being processed",
    );
  }
}
