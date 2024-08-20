import { expect, FrameLocator, Locator, Page } from "@playwright/test";

export class CancelPaymentComponent {
  private readonly header: Locator;
  private readonly optionBtn: Locator;
  private readonly proceedBtn: Locator;
  private readonly frameLocator: FrameLocator;

  constructor(
    public readonly page: Page,
    private readonly frame,
  ) {
    this.frameLocator = page.frameLocator(frame);
    this.header = this.frameLocator.getByRole("heading", {
      name: "Are you sure you want to cancel your payment?",
    });
    this.optionBtn = this.frameLocator.getByLabel("Select None of the above");
    this.proceedBtn = this.frameLocator.getByRole("button", {
      name: "Yes, cancel",
    });
  }

  async proceedAndCancelPayment() {
    await expect(this.header).toBeVisible();
    await this.optionBtn.click();
    await this.proceedBtn.click();
  }
}
