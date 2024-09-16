import { expect, Locator, Page } from "@playwright/test";

export class PaymentRejected {
  private readonly header: Locator;
  private readonly infoText: Locator;
  private readonly loadingText: Locator;
  private readonly goBackBtn: Locator;

  constructor(public readonly page: Page) {
    this.header = this.page.getByRole("heading", {
      name: "That didn’t work",
    });
    this.infoText = this.page.getByText(
      "Mock Ireland Payments – Redirect Flow rejected your transaction. Go back to payments to change bank or try again.",
    );
    this.loadingText = this.page.getByText("Confirming your payment");
    this.goBackBtn = this.page.getByRole("button", { name: "Go back" });
  }

  async checkIsFailed() {
    await expect(this.loadingText.or(this.header)).toBeVisible();
    await expect(this.infoText).toBeVisible();
  }

  async goBack() {
    await this.goBackBtn.click();
  }

  async getReferenceCode() {
    const refText = await this.page.getByRole("heading", { level: 2 });
    return (await refText.innerText()).replace("(ref. ", "").replace(")", "");
  }
}
