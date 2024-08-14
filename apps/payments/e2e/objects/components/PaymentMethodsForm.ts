import { type Page, type Locator, expect } from "@playwright/test";
import { PaymentMethod, paymentMethodCheckboxLabelMap } from "../../utils";

export class PaymentMethodForm {
  private readonly paymentMethodHeader: Locator;
  private readonly confirmBtn: Locator;

  constructor(public readonly page: Page) {
    this.paymentMethodHeader = page.getByRole("heading", {
      name: "Choose payment method",
    });
    this.confirmBtn = page.getByRole("button", { name: "Confirm method" });
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

  async checkButtonEnabled() {
    await expect(this.confirmBtn).toBeVisible();
    await expect(this.confirmBtn).toBeEnabled();
  }

  async checkButtonDisabled() {
    await expect(this.confirmBtn).toBeVisible();
    await expect(this.confirmBtn).toBeDisabled();
  }
}
