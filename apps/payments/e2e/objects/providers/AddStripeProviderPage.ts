import { type Page, type Locator } from "@playwright/test";
import { providersUrl } from "../../utils/constants";
import {
  mockStripePublishableKey,
  mockStripeSecretKey,
} from "../../utils/mocks";
import { StripeProviderForm } from "../components/StripeProviderForm";

export class AddStripeProviderPage {
  public readonly providerForm: StripeProviderForm;
  private readonly confirmButton: Locator;

  constructor(public readonly page: Page) {
    this.providerForm = new StripeProviderForm(page);
    this.confirmButton = this.page.getByRole("button", { name: "Confirm" });
  }

  async goto() {
    await this.page.goto(`${providersUrl}/add-stripe`);
  }

  async submitProviderCreation() {
    await this.confirmButton.click();
  }

  async create(name: string) {
    await this.providerForm.enterName(name);
    await this.providerForm.enterPublishableKey(mockStripePublishableKey);
    await this.providerForm.enterSecretKey(mockStripeSecretKey);
    await this.submitProviderCreation();

    await this.page.waitForURL(providersUrl);
  }
}
