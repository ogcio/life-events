import { expect, FrameLocator, Locator, Page } from "@playwright/test";

export class CountrySelection {
  private readonly header: Locator;
  private readonly searchInput: Locator;
  private readonly irelandOption: Locator;
  private readonly frameLocator: FrameLocator;

  constructor(
    public readonly page: Page,
    private readonly frame,
  ) {
    this.frameLocator = page.frameLocator(frame);
    this.header = this.frameLocator.getByRole("heading", {
      name: "Choose your country",
    });
    this.searchInput = this.frameLocator.getByPlaceholder(
      "Search for your country",
    );
    this.irelandOption = this.frameLocator.getByRole("option", {
      name: "Select Ireland",
    });
  }

  async checkHeader() {
    await expect(this.header).toBeVisible();
  }

  async chooseIreland() {
    await this.searchInput.fill("Ireland");
    await this.irelandOption.click();
  }
}
