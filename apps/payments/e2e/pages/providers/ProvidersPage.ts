import { type Page, type Locator, expect } from "@playwright/test";
import { providersUrl } from "../../utils/constants";
import { AddStripeProviderPage } from "./AddStripeProviderPage";
import { AddOpenBankingProviderPage } from "./AddOpenbankingProviderPage";
import { AddManualBankTransferProviderPage } from "./AddManualBankTransferProviderPage";
import { ProviderType } from "../../../app/[locale]/(hosted)/paymentSetup/providers/types";

export class ProvidersPage {
  private readonly createNewAccountBtn: Locator;

  constructor(public readonly page: Page) {
    this.createNewAccountBtn = this.page.getByRole("button", {
      name: "New account",
    });
  }

  async goto() {
    await this.page.goto(providersUrl);
  }

  async addProvider(name: string, type: ProviderType) {
    await this.createNewAccountBtn.click();
    switch (type) {
      case "banktransfer":
        await this.createManualBankTransferProvider(name);
        break;
      case "stripe":
        await this.createStripeProvider(name);
        break;
      case "openbanking":
        await this.createOpenBankingProvider(name);
        break;
      default:
        throw new Error(`Invalid provider type: ${type}`);
    }

    const accountName = await this.page.getByRole("cell", {
      name,
      exact: true,
    });
    await expect(accountName).toBeVisible();
  }

  async createManualBankTransferProvider(name: string) {
    await this.page
      .getByRole("button", { name: "Select Manual Bank Transfer" })
      .click();
    const addManualBankTransferProviderPage =
      new AddManualBankTransferProviderPage(this.page);
    await addManualBankTransferProviderPage.create(name);
  }

  async createOpenBankingProvider(name: string) {
    await this.page.getByRole("button", { name: "Select Openbanking" }).click();
    const addOpenBankingProviderPage = new AddOpenBankingProviderPage(
      this.page,
    );
    await addOpenBankingProviderPage.create(name);
  }

  async createStripeProvider(name: string) {
    await this.page.getByRole("button", { name: "Select Stripe" }).click();
    const addStripeProviderPage = new AddStripeProviderPage(this.page);
    await addStripeProviderPage.create(name);
  }
}
