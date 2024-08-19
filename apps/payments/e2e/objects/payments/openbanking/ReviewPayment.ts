import { expect, FrameLocator, Locator, Page } from "@playwright/test";

export class ReviewPayment {
  private readonly header: Locator;
  private readonly transferInfo: (name: string) => Locator;
  private readonly amountText: (amount: string) => Locator;
  private readonly goToBankBtn: Locator;
  private readonly frameLocator: FrameLocator;

  constructor(
    public readonly page: Page,
    private readonly frame,
  ) {
    this.frameLocator = page.frameLocator(frame);
    this.header = this.frameLocator.getByRole("heading", {
      name: "Review payment",
    });
    this.transferInfo = (name: string) =>
      this.frameLocator.getByText(`You're sending ${name} (payments)`);
    this.amountText = (amount: string) =>
      this.frameLocator.getByText(`€${amount}`);
    this.goToBankBtn = this.frameLocator.getByRole("button", {
      name: "Go to bank",
    });
  }

  async checkPayment({
    amount,
    accountHolder,
  }: {
    amount: string;
    accountHolder: string;
  }) {
    await expect(this.header).toBeVisible();
    await expect(this.transferInfo(accountHolder)).toBeVisible();
    await expect(this.amountText(amount)).toBeVisible();
  }

  async proceed() {
    await this.goToBankBtn.click();
  }
}
