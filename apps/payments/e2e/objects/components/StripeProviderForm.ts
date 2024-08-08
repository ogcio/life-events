import { expect, Locator, Page } from "@playwright/test";
import {
  providerValidationErrorTexts,
  StripeValidationError,
} from "../../utils/constants";

export class StripeProviderForm {
  private readonly nameInput: Locator;
  private readonly publishableKey: Locator;
  private readonly secretKey: Locator;

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

  async checkName(name: string) {
    await expect(this.nameInput).toHaveValue(name);
  }

  async checkPublishableKey(key: string) {
    await expect(this.publishableKey).toHaveValue(key);
  }

  async checkSecretKey(key: string) {
    await expect(this.secretKey).toHaveValue(key);
  }

  async expectValidationError(expectedError: StripeValidationError) {
    const errorMessage = await this.page.getByText(
      providerValidationErrorTexts[expectedError],
    );
    await expect(errorMessage).toBeVisible();
  }
}
