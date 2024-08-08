import { expect, Locator, Page } from "@playwright/test";
import {
  providerValidationErrorTexts,
  RealexValidationError,
} from "../../utils/constants";

export class RealexProviderForm {
  private readonly nameInput: Locator;
  private readonly merchantId: Locator;
  private readonly sharedSecret: Locator;

  constructor(public readonly page: Page) {
    this.nameInput = this.page.getByRole("textbox", {
      name: "Name",
      exact: true,
    });
    this.merchantId = this.page.getByRole("textbox", {
      name: "Merchant Id",
    });
    this.sharedSecret = this.page.getByRole("textbox", {
      name: "Shared secret",
    });
  }

  async enterName(name: string) {
    await this.nameInput.fill(name);
  }

  async enterMerchantId(id: string) {
    await this.merchantId.fill(id);
  }

  async enterSharedSecret(key: string) {
    await this.sharedSecret.fill(key);
  }

  async checkName(name: string) {
    await expect(this.nameInput).toHaveValue(name);
  }

  async checkMerchantId(id: string) {
    await expect(this.merchantId).toHaveValue(id);
  }

  async checkSharedSecret(key: string) {
    await expect(this.sharedSecret).toHaveValue(key);
  }

  async expectValidationError(expectedError: RealexValidationError) {
    const errorMessage = await this.page.getByText(
      providerValidationErrorTexts[expectedError],
    );
    await expect(errorMessage).toBeVisible();
  }
}
