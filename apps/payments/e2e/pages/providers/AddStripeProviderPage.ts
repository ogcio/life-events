import { type Page, type Locator } from "@playwright/test";
import { providersUrl } from "../../utils/constants";
import {
  mockStripePublishableKey,
  mockStripeSecretKey,
} from "../../utils/mocks";

export class AddStripeProviderPage {
  private readonly nameInput: Locator;
  private readonly publishableKey: Locator;
  private readonly secretKey: Locator;
  private readonly confirmButton: Locator;

  constructor(public readonly page: Page) {
    this.nameInput = this.page.getByRole("textbox", {
      name: "Name",
      exact: true,
    });
    this.publishableKey = this.page.getByRole("textbox", {
      name: "Live Publishable Key",
    });
    this.secretKey = this.page.getByRole("textbox", {
      name: "Live Secret Key",
    });
    this.confirmButton = this.page.getByRole("button", { name: "Confirm" });
  }

  async goto() {
    await this.page.goto(`${providersUrl}/add-stripe`);
  }

  async create(name: string) {
    await this.nameInput.fill(name);
    await this.publishableKey.fill(mockStripePublishableKey);
    await this.secretKey.fill(mockStripeSecretKey);
    await this.confirmButton.click();

    await this.page.waitForURL(providersUrl);
  }
}
