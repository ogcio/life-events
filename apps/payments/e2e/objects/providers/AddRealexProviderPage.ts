import { type Page, type Locator, expect } from "@playwright/test";
import {
  providersUrl,
  RealexValidationError,
  validationErrorTexts,
} from "../../utils/constants";
import {
  mockRealexMerchantId,
  mockRealexSharedSecret,
} from "../../utils/mocks";

export class AddRealexProviderPage {
  private readonly nameInput: Locator;
  private readonly merchantId: Locator;
  private readonly sharedSecret: Locator;
  private readonly confirmButton: Locator;

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
    this.confirmButton = this.page.getByRole("button", { name: "Confirm" });
  }

  async goto() {
    await this.page.goto(`${providersUrl}/add-realex`);
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

  async submitProviderCreation() {
    await this.confirmButton.click();
  }

  async expectValidationError(expectedError: RealexValidationError) {
    const errorMessage = await this.page.getByText(
      validationErrorTexts[expectedError],
    );
    await expect(errorMessage).toBeVisible();
  }

  async create(name: string) {
    await this.enterName(name);
    await this.enterMerchantId(mockRealexMerchantId);
    await this.enterSharedSecret(mockRealexSharedSecret);
    await this.submitProviderCreation();

    await this.page.waitForURL(providersUrl);
  }
}
