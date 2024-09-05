import { type Page, type Locator, expect } from "@playwright/test";
import { landingPageUrl } from "../../utils/constants";

export class FilesPage {
  private readonly uploadFileButton: Locator;
  private readonly header: Locator;

  constructor(public readonly page: Page) {
    this.uploadFileButton = this.page.getByRole("button", {
      name: "Upload",
    });
    this.header = this.page.getByText("Welcome to file explorer");
  }

  async goto() {
    await this.page.goto(landingPageUrl);
  }

  async checkHeader() {
    await expect(this.header).toBeVisible();
  }
}
