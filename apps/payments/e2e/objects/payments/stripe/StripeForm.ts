import {
  type Page,
  type Locator,
  expect,
  FrameLocator,
} from "@playwright/test";

export class StripeForm {
  private readonly frameLocator: FrameLocator;
  public readonly cardNumber: Locator;
  public readonly extDate: Locator;
  public readonly securityCode: Locator;
  public readonly countrySelector: Locator;
  public readonly submitButton: Locator;

  constructor(public readonly page: Page) {
    this.frameLocator = page.frameLocator(
      'iframe[title="Secure payment input frame"]',
    );
    this.cardNumber = this.frameLocator.getByLabel("Card number");
    this.extDate = this.frameLocator.getByPlaceholder("MM / YY");
    this.securityCode = this.frameLocator.getByLabel("Security code");
    this.countrySelector = this.frameLocator.getByLabel("Country");
    this.submitButton = this.page.getByRole("button", { name: "Pay now" });
  }

  async checkForm() {
    await expect(this.cardNumber).toBeVisible();
    await expect(this.extDate).toBeVisible();
    await expect(this.securityCode).toBeVisible();
    await expect(this.countrySelector).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }
}
