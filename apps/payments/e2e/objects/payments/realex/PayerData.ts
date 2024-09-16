import { type Page, type Locator } from "@playwright/test";

export class PayerData {
  private readonly emailInput: Locator;
  private readonly nameInput: Locator;
  private readonly streetInput: Locator;
  private readonly countrySelect: Locator;
  private readonly stateInput: Locator;
  private readonly cityInput: Locator;
  private readonly ZIPInput: Locator;
  private readonly phoneInput: Locator;
  private readonly continueBtn: Locator;

  constructor(public readonly page: Page) {
    this.emailInput = page.getByLabel("Email Address");
    this.nameInput = page.getByRole("textbox", {
      name: "Full Name (First and Last",
    });
    this.streetInput = page.getByRole("textbox", { name: "Street Address" });
    this.countrySelect = page.getByRole("combobox", { name: "Country" });
    this.stateInput = page.locator("input#countyText_b");
    this.cityInput = page.getByRole("textbox", { name: "City / Town" });
    this.ZIPInput = page.getByRole("textbox", {
      name: "ZIP / Postal Code / Eircode",
    });
    this.phoneInput = page.getByRole("textbox", { name: "Phone Number" });
    this.continueBtn = page.getByRole("button", { name: "Continue" });
  }

  async enterEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async enterName(name: string) {
    await this.nameInput.fill(name);
  }

  async enterStreet(street: string) {
    await this.streetInput.fill(street);
  }

  async enterCountry(country: string) {
    await this.countrySelect.selectOption(country);
  }

  async enterState(state: string) {
    await this.stateInput.fill(state);
  }

  async enterCity(city: string) {
    await this.cityInput.fill(city);
  }

  async enterZIP(ZIP: string) {
    await this.ZIPInput.fill(ZIP);
  }

  async enterPhoneNumber(number: string) {
    await this.phoneInput.fill(number);
  }

  async continue() {
    await this.continueBtn.click();
  }
}
