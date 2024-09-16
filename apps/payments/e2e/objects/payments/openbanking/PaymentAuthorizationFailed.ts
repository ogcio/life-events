import { expect, Locator, Page } from "@playwright/test";

export class PaymentAuthorizationFailed {
  private readonly header: Locator;
  private readonly infoText: Locator;
  private readonly loadingText: Locator;
  private readonly goBackBtn: Locator;

  constructor(public readonly page: Page) {
    this.header = this.page.getByRole("heading", {
      name: "Authorisation failed",
    });
    this.infoText = this.page.getByText(
      "The transaction was not authorised successfully. You can go back to payments, so you can change bank or try again.",
    );
    this.loadingText = this.page.getByText("Confirming your payment");
    this.goBackBtn = this.page.getByRole("button", { name: "Go back" });
  }

  async checkIsFailed() {
    await expect(this.loadingText).toBeVisible();
    await expect(this.infoText).toBeVisible();
    await expect(this.header).toBeVisible();
  }

  async goBack() {
    await this.goBackBtn.click();
  }

  async getReferenceCode() {
    const refText = await this.page.getByRole("heading", { level: 2 });
    return (await refText.innerText()).replace("(ref. ", "").replace(")", "");
  }
}
