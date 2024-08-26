import { expect, Locator, Page } from "@playwright/test";

export class PaymentInProgress {
  private readonly header: Locator;
  private readonly infoText: (amount: string) => Locator;
  private readonly loadingText: Locator;
  private readonly continueBtn: Locator;

  constructor(public readonly page: Page) {
    this.header = this.page.getByRole("heading", { name: "In progress" });
    this.infoText = (amount: string) =>
      this.page.getByText(
        `We are processing your transaction of €${amount} — There\’s no need to wait here, you can return to payments.`,
      );
    this.loadingText = this.page.getByText("Confirming your payment");
    this.continueBtn = this.page.getByRole("button", { name: "Continue" });
  }

  async checkIsInProgress(amount: string) {
    await expect(this.loadingText.or(this.header)).toBeVisible();
    await expect(this.infoText(amount)).toBeVisible();
  }

  async continue() {
    await this.continueBtn.click();
  }
}
