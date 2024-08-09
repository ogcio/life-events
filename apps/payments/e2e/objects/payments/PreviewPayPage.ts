import { type Page, type Locator, expect } from "@playwright/test";
import { PaymentMethod, paymentMethodCheckboxLabelMap } from "../../utils";

export class PreviewPayPage {
  private readonly header: Locator;
  private readonly totalText: (amount: string) => Locator;
  private readonly paymentMethodHeader: Locator;
  private readonly confirmBtn: Locator;

  constructor(public readonly page: Page) {
    this.header = page.getByRole("heading", { name: "Pay your fee" });
    this.totalText = (amount: string) =>
      page.getByRole("heading", {
        name: `Total to pay: €${amount}`,
      });
    this.paymentMethodHeader = page.getByRole("heading", {
      name: "Choose payment method",
    });
    this.confirmBtn = page.getByRole("button", { name: "Confirm method" });
  }

  async checkHeader() {
    await expect(this.header).toBeVisible();
  }

  async checkAmount(amount: string) {
    await expect(this.totalText(amount)).toBeVisible();
  }

  async checkPaymentMethodHeader() {
    await expect(this.paymentMethodHeader).toBeVisible();
  }

  async checkPaymentMethodVisible(providerType: PaymentMethod) {
    await expect(
      this.page.getByText(paymentMethodCheckboxLabelMap[providerType]),
    ).toBeVisible();
  }

  async checkPaymentMethodNotVisible(providerType: PaymentMethod) {
    await expect(
      this.page.getByText(paymentMethodCheckboxLabelMap[providerType]),
    ).not.toBeVisible();
  }

  async checkButton() {
    await expect(this.confirmBtn).toBeVisible();
    await expect(this.confirmBtn).toBeDisabled();
  }
}
