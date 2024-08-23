import { type Page, type Locator, expect } from "@playwright/test";
import { PayerData } from "./PayerData";

export class RealexTransactionPage {
  private readonly header: Locator;
  private readonly manualCheckoutBtn: Locator;
  public readonly PayerData: PayerData;
  private readonly continueBtn: Locator;

  constructor(public readonly page: Page) {
    this.header = page.getByRole("heading", {
      name: "Payment Details",
    });
    this.manualCheckoutBtn = page.getByRole("button", {
      name: "Or complete checkout",
    });
    this.PayerData = new PayerData(page);
    this.continueBtn = page.getByRole("button", { name: "Continue" });
  }

  async checkHeader() {
    await expect(this.header).toBeVisible();
  }

  async chooseManualCheckout() {
    await this.manualCheckoutBtn.click();
    await expect(this.page.getByText("Billing Details")).toBeVisible();
  }

  async continue() {
    await this.continueBtn.click();
  }
}
