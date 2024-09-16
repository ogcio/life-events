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
      this.page.getByLabel(paymentMethodCheckboxLabelMap[providerType]),
    ).toBeVisible();
  }

  async checkPaymentMethodNotVisible(providerType: PaymentMethod) {
    await expect(
      this.page.getByLabel(paymentMethodCheckboxLabelMap[providerType]),
    ).not.toBeVisible();
  }

  async choosePaymentMethod(method: PaymentMethod) {
    const option = this.page.getByLabel(paymentMethodCheckboxLabelMap[method]);
    await option.check();
  }

  async checkButtonEnabled() {
    await expect(this.confirmBtn).toBeVisible();
    await expect(this.confirmBtn).toBeEnabled();
  }

  async checkButtonDisabled() {
    await expect(this.confirmBtn).toBeVisible();
    await expect(this.confirmBtn).toBeDisabled();
  }

  async proceedToPayment() {
    await this.confirmBtn.click();
  }
}
