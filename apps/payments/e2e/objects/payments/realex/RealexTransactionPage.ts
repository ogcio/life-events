import { type Page, type Locator, expect } from "@playwright/test";
import { PayerData } from "./PayerData";
import { CardData } from "./CardData";

export class RealexTransactionPage {
  private readonly header: Locator;
  private readonly manualCheckoutBtn: Locator;
  public readonly payerData: PayerData;
  public readonly cardData: CardData;

  constructor(public readonly page: Page) {
    this.header = page.getByRole("heading", {
      name: "Payment Details",
    });
    this.manualCheckoutBtn = page.getByRole("button", {
      name: "Or complete checkout manually",
    });
    this.payerData = new PayerData(page);
    this.cardData = new CardData(page);
  }

  async checkHeader() {
    await expect(this.header).toBeVisible();
  }

  async chooseManualCheckout() {
    await this.manualCheckoutBtn.click();
    await expect(this.page.getByText("Billing Details")).toBeVisible();
  }
}
