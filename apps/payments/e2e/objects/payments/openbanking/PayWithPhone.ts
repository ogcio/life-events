import { expect, FrameLocator, Locator, Page } from "@playwright/test";

export class PayWithPhone {
  private readonly header: Locator;
  private readonly desktopBtn: Locator;
  private readonly frameLocator: FrameLocator;

  constructor(
    public readonly page: Page,
    private readonly frame,
  ) {
    this.frameLocator = page.frameLocator(frame);
    this.header = this.frameLocator.getByRole("heading", {
      name: "Pay with your phone",
    });
    this.desktopBtn = this.frameLocator.getByRole("button", {
      name: "or continue on desktop",
    });
  }

  async proceedToPayment() {
    await expect(this.header).toBeVisible();
    await this.desktopBtn.click();
  }
}
