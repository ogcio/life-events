import { type Page, type Locator, expect } from "@playwright/test";

export class InactivePublicServantPage {
  private readonly title: Locator;
  private readonly description: Locator;

  private readonly pageTitle = "Your account is under review";
  private readonly pageDescription =
    "Thanks for creating an account in the Building Blocks Ecosystem. Your account as a public servant has now been created.";

  constructor(public readonly page: Page) {
    this.title = this.page.getByRole("heading", {
      name: this.pageTitle,
    });
    this.description = this.page.getByText(this.pageDescription);
  }

  async checkPageContent() {
    await expect(this.title).toBeVisible();
    await expect(this.description).toBeVisible();
  }
}
