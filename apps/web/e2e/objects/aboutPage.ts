import { Page, expect } from "@playwright/test";

export class AboutPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateTo() {
    await this.page.goto("/");
  }

  async clickAboutPage() {
    await this.page.getByText("About Page").click();
  }

  async expectUrl() {
    await expect(this.page).toHaveURL("/home/about");
  }

  async expectHeading() {
    await expect(this.page.getByRole("heading", { level: 1 })).toContainText(
      "About Page",
    );
  }

  async navigateToAuth() {
    await this.page.goto(
      "http://localhost:3005/auth?redirectUrl=http://localhost:3000/",
    );
  }

  async fillTextbox(text: string) {
    await this.page.getByRole("textbox").click();
    await this.page.getByRole("textbox").fill(text);
  }

  async navigateToWelcome() {
    await this.page.goto("http://localhost:3000/en/welcome?redirect_url=%2Fen");
  }

  async clickEventsMenu() {
    await this.page.getByLabel("events-menu").click();
  }

  async expectAboutMeInList() {
    await expect(this.page.getByRole("list")).toContainText("About me");
  }
}
