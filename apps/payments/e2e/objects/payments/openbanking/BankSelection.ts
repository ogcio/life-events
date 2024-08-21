import { expect, FrameLocator, Locator, Page } from "@playwright/test";

export class BankSelection {
  private readonly header: Locator;
  private readonly searchInput: Locator;
  private readonly mockBankOption: Locator;
  private readonly frameLocator: FrameLocator;

  constructor(
    public readonly page: Page,
    private readonly frame,
  ) {
    this.frameLocator = page.frameLocator(frame);
    this.header = this.frameLocator.getByRole("heading", {
      name: "Choose your bank",
    });
    this.searchInput = this.frameLocator.getByPlaceholder(
      "Search for your bank",
    );
    this.mockBankOption = this.frameLocator.getByRole("option", {
      name: "Select Mock Ireland Payments – Redirect Flow",
    });
  }

  async checkHeader() {
    await expect(this.header).toBeVisible();
  }

  async chooseMockBank() {
    await this.searchInput.fill("Mock Ireland Payments");
    await this.mockBankOption.click();
  }
}
