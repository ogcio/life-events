import { type Page, type Locator } from "@playwright/test";

export class CardData {
  private readonly cardNumberInput: Locator;
  private readonly expiryInput: Locator;
  private readonly securityCodeInput: Locator;
  private readonly cardholderNameInput: Locator;
  private readonly payBtn: Locator;

  constructor(public readonly page: Page) {
    this.cardNumberInput = page.getByPlaceholder("Card Number");
    this.expiryInput = page.getByPlaceholder("MM/YY");
    this.securityCodeInput = page.getByPlaceholder("Security Code");
    this.cardholderNameInput = page.getByPlaceholder("Cardholder Name");
    this.payBtn = page.getByRole("button", { name: "Proceed to verification" });
  }

  async enterCardNumber(num: string) {
    await this.cardNumberInput.fill(num);
  }

  async enterExpiry(date: string) {
    await this.expiryInput.fill(date);
  }

  async enterSecurityCode(code: string) {
    await this.securityCodeInput.fill(code);
  }

  async enterCardholderName(name: string) {
    await this.cardholderNameInput.fill(name);
  }

  async pay() {
    await this.payBtn.click();
  }
}
