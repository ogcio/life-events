import { type Page, type Locator, expect } from "@playwright/test";

export class ErrorPage {
  private readonly title: Locator;
  private readonly description: Locator;
  private readonly homeBttn: Locator;

  private readonly pageTitle = "Ops, something went wrong";
  private readonly pageDescription =
    "We're sorry, but something unexpected happened and we couldn't process your request. Please try refreshing the page or come back later. If the problem persists, contact our support team for assistance. Thank you for your patience!";

  constructor(public readonly page: Page) {
    this.title = this.page.getByRole("heading", {
      name: this.pageTitle,
    });
    this.description = this.page.getByText(this.pageDescription);
    this.homeBttn = this.page.getByRole("button", {
      name: "Return Home",
    });
  }

  async checkPageContent() {
    await expect(this.title).toBeVisible();
    await expect(this.description).toBeVisible();
    await expect(this.homeBttn).toBeVisible();
  }
}
