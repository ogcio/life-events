import { type Page, type Locator, expect } from "@playwright/test";
import {
  providersUrl,
  StripeValidationError,
  providerValidationErrorTexts,
} from "../../utils/constants";
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

  async enterName(name: string) {
    await this.nameInput.fill(name);
  }

  async enterPublishableKey(key: string) {
    await this.publishableKey.fill(key);
  }

  async enterSecretKey(key: string) {
    await this.secretKey.fill(key);
  }

  async submitProviderCreation() {
    await this.confirmButton.click();
  }

  async expectValidationError(expectedError: StripeValidationError) {
    const errorMessage = await this.page.getByText(
      providerValidationErrorTexts[expectedError],
    );
    await expect(errorMessage).toBeVisible();
  }

  async create(name: string) {
    await this.enterName(name);
    await this.enterPublishableKey(mockStripePublishableKey);
    await this.enterSecretKey(mockStripeSecretKey);
    await this.submitProviderCreation();

    await this.page.waitForURL(providersUrl);
  }
}
