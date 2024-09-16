import { type Page, type Locator, expect } from "@playwright/test";

export class InactivePublicServantPage {
  private readonly description: Locator;
  private readonly pageDescription = "Error retrieving files";

  constructor(public readonly page: Page) {
    this.description = this.page.getByText(this.pageDescription);
  }

  async checkPageContent() {
    await expect(this.description).toBeVisible();
  }
}
