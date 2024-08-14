import { Locator, Page, expect } from "@playwright/test";
import { myGovIdMockSettings } from "../utils/constants";

export class MyGovIdMockLoginPage {
  readonly pwInput: Locator;

  constructor(public readonly page: Page) {
    this.pwInput = this.page.getByRole("textbox");
  }

  async selectPublicServantUser(publicServantUser: string) {
    const [name, surname] = publicServantUser.split(" ");
    const email = `${name.toLocaleLowerCase()}.${surname.toLocaleLowerCase()}@${myGovIdMockSettings.publicServantEmailDomain}`;
    await this.page.getByLabel("Select user").selectOption(email);
  }

  async selectCitizen(citizen: string) {
    const [name, surname] = citizen.split(" ");
    const email = `${name.toLocaleLowerCase()}.${surname.toLocaleLowerCase()}@${myGovIdMockSettings.citizenEmailDomain}`;
    await this.page.getByLabel("Select user").selectOption(email);
  }

  async enterPassword(password: string) {
    await this.pwInput.fill(password);
  }

  async submitLogin(userName: string) {
    await this.page.getByRole("button", { name: `Login ${userName}` }).click();
  }

  async expectPaymentSetupPage() {
    const heading = await this.page.getByRole("heading", {
      name: "Payments",
      exact: true,
    });
    await expect(heading).toBeVisible();
  }

  async expectCitizenPaymentsPage() {
    const heading = await this.page.getByRole("heading", {
      name: "My Payments",
      exact: true,
    });
    await expect(heading).toBeVisible();
  }
}
