import { Page, expect } from "@playwright/test";

export class LogoutPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async clickLogout() {
    const logoutButton = this.page.getByLabel("Logout");
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();
  }

  async expectMyGovIdLogo() {
    const mygovidLogo = this.page.locator("#mygovid-logo.icon-mygovid_logo");
    await expect(mygovidLogo).toHaveCount(1);
    await expect(mygovidLogo).toBeVisible();
  }
}
