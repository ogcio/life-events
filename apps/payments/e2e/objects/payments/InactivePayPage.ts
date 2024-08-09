import { type Page, type Locator, expect } from "@playwright/test";

export class InactivePayPage {
  private readonly header: Locator;
  private readonly description: Locator;

  constructor(public readonly page: Page) {
    this.header = page.getByRole("heading", {
      name: "The payment request is inactive",
    });
    this.description = page.getByText(
      "This payment request is currently inactive and cannot be used to receive payments.",
    );
  }

  async checkHeader() {
    await expect(this.header).toBeVisible;
  }

  async checkDescription() {
    await expect(this.description).toBeVisible;
  }
}
