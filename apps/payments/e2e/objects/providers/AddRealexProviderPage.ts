import { type Page, type Locator } from "@playwright/test";
import { providersUrl } from "../../utils/constants";
import {
  mockRealexMerchantId,
  mockRealexSharedSecret,
} from "../../utils/mocks";
import { RealexProviderForm } from "../components/RealexProviderForm";

export class AddRealexProviderPage {
  public readonly providerForm: RealexProviderForm;
  private readonly confirmButton: Locator;

  constructor(public readonly page: Page) {
    this.providerForm = new RealexProviderForm(page);
    this.confirmButton = this.page.getByRole("button", { name: "Confirm" });
  }

  async goto() {
    await this.page.goto(`${providersUrl}/add-realex`);
  }

  async submitProviderCreation() {
    await this.confirmButton.click();
  }

  async create(name: string) {
    await this.providerForm.enterName(name);
    await this.providerForm.enterMerchantId(
      process.env.REALEX_MERCHANT_ID ?? mockRealexMerchantId,
    );
    await this.providerForm.enterSharedSecret(
      process.env.REALEX_SHARED_SECRET ?? mockRealexSharedSecret,
    );
    await this.submitProviderCreation();

    await this.page.waitForURL(providersUrl);
  }
}
