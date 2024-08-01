import { Locator, Page, expect } from "@playwright/test";
import { publicServantEmailDomain } from "../utils/constants";

export class LoginPage {
  readonly pwInput: Locator;

  constructor(public readonly page: Page) {
    this.pwInput = this.page.getByRole("textbox");
  }

  async selectPublicServantUser(publicServantUser: string) {
    const [name, surname] = publicServantUser.split(" ");
    const email = `${name.toLocaleLowerCase()}.${surname.toLocaleLowerCase()}@${publicServantEmailDomain}`;
    await this.page.getByLabel("Select user").selectOption(email);
  }

  async enterPassword(password: string) {
    await this.pwInput.fill(password);
  }

  async login(userName: string) {
    await this.page.getByRole("button", { name: `Login ${userName}` }).click();
  }

  async expectPaymentSetupPage() {
    const heading = await this.page.getByRole("heading", {
      name: "Payments",
      exact: true,
    });
    await expect(heading).toBeVisible();
  }
}
