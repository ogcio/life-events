import { Page, test, expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateTo() {
    await this.page.goto("");
  }

  async clickPublicServant() {
    await this.page.click("text=Public Servant");
  }

  async expectTitle(title: string) {
    await expect(this.page).toHaveTitle(title);
  }

  async expectPublicServantText() {
    await expect(
      this.page.locator("label >> text=Public Servant"),
    ).toContainText("Public Servant");
  }

  async enterPassword(password: string) {
    await this.page.locator('//input[@name="password"]').click();
    await this.page.locator('//input[@name="password"]').fill(password);
  }

  async clickSubmit() {
    await this.page.click("//*[@id='submit_btn']");
  }

  async expectPasswordRequired() {
    await expect(this.page.locator('input[name="password"]')).toHaveAttribute(
      "required",
      "",
    );
  }
}
