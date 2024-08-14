import { type Page, type Locator, expect } from "@playwright/test";
import { CustomAmountForm } from "../components/CustomAmountForm";
import { PaymentMethodForm } from "../components/PaymentMethodsForm";

export class PayPage {
  private readonly header: Locator;
  private readonly totalText: (amount: string) => Locator;
  public readonly customAmountForm: CustomAmountForm;
  public readonly paymentMethodForm: PaymentMethodForm;

  constructor(public readonly page: Page) {
    this.header = page.getByRole("heading", { name: "Pay your fee" });
    this.totalText = (amount: string) =>
      page.getByRole("heading", {
        name: `Total to pay: €${amount}`,
      });
    this.customAmountForm = new CustomAmountForm(page);
    this.paymentMethodForm = new PaymentMethodForm(page);
  }

  async checkHeader() {
    await expect(this.header).toBeVisible();
  }

  async checkAmount(amount: string) {
    await expect(this.totalText(amount)).toBeVisible();
  }
}
