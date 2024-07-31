import { Page, expect } from "@playwright/test";

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
    const passwordField = this.page.locator('//input[@name="password"]');
    await passwordField.click();
    await passwordField.fill(password);
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

  async expectMyGovIdLogo() {
    const mygovidLogo = this.page.locator("#mygovid-logo.icon-mygovid_logo");
    await expect(mygovidLogo).toHaveCount(1);
    await expect(mygovidLogo).toBeVisible();
  }

  async expectMainElements() {
    await expect(
      this.page.locator('div[style="display: flex; flex-direction: column"]'),
    ).toBeVisible();
    await expect(
      this.page.locator("label >> text=Public Servant"),
    ).toBeVisible();
    await expect(
      this.page.locator("label >> text=Public Servant"),
    ).toContainText("Public Servant");
    await expect(
      this.page.locator("label >> text=Verification level"),
    ).toBeVisible();
    await expect(
      this.page.locator("label >> text=Verification level"),
    ).toContainText("Verification level");

    const userSelectLabel = this.page.locator(
      'div.password-label label[for="user_select"]',
    );
    await expect(userSelectLabel).toBeVisible();
    await expect(userSelectLabel).toHaveText("Select user");

    const passwordLabel = this.page.locator('label[for="password"]');
    await expect(passwordLabel).toBeVisible();
    await expect(passwordLabel).toHaveText("Password");

    const loginButton = this.page.locator("#submit_btn");
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toHaveAttribute("id", "submit_btn");
    await expect(loginButton).toHaveAttribute("type", "submit");
    const buttonText = await loginButton.textContent();
    expect(buttonText).toContain("Login");
  }

  async expectVerificationLevelOptions() {
    const verificationLevelDropdown = this.page.locator(
      'select[name="verificationLevel"]',
    );

    await expect(verificationLevelDropdown).toBeVisible();

    const options = verificationLevelDropdown.locator("option");

    await expect(options).toHaveCount(3);

    for (let i = 0; i < 3; i++) {
      const option = options.nth(i);
      const optionText = await option.textContent();
      const optionValue = await option.getAttribute("value");

      switch (i) {
        case 0:
          expect(optionText).toBe("Level 0");
          expect(optionValue).toBe("0");
          break;
        case 1:
          expect(optionText).toBe("Level 1");
          expect(optionValue).toBe("1");
          break;
        case 2:
          expect(optionText).toBe("Level 2");
          expect(optionValue).toBe("2");
          break;
      }
    }
  }

  async expectWelcomeMessage() {
    const h1Locator = this.page.locator("h1.govie-heading-l");
    await expect(h1Locator).toBeVisible();
    await expect(h1Locator).toHaveText("Welcome to Life Events");
  }
}
