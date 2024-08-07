import { type Page, type Locator, expect } from "@playwright/test";
import { providersUrl } from "../../utils/constants";
import { AddStripeProviderPage } from "./AddStripeProviderPage";
import { AddOpenBankingProviderPage } from "./AddOpenBankingProviderPage";
import { AddManualBankTransferProviderPage } from "./AddManualBankTransferProviderPage";
import { ProviderType } from "../../../app/[locale]/(hosted)/paymentSetup/providers/types";
import { AddRealexProviderPage } from "./AddRealexProviderPage";

export class ProvidersPage {
  private readonly createNewAccountBtn: Locator;

  constructor(public readonly page: Page) {
    this.createNewAccountBtn = this.page.getByRole("button", {
      name: "Create payment provider",
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
      case "realex":
        await this.createRealexProvider(name);
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

  async createNewPaymentProvider() {
    await this.createNewAccountBtn.click();
  }

  async selectManualBankTransferProvider() {
    await this.page
      .getByRole("button", { name: "Select Manual Bank Transfer" })
      .click();
  }

  async selectOpenBankingProvider() {
    await this.page.getByRole("button", { name: "Select OpenBanking" }).click();
  }

  async selectStripeProvider() {
    await this.page.getByRole("button", { name: "Select Stripe" }).click();
  }

  async selectRealexProvider() {
    await this.page.getByRole("button", { name: "Select Realex" }).click();
  }

  async checkProviderVisible(name: string) {
    const accountName = await this.page.getByRole("cell", { name });
    await expect(accountName).toBeVisible();
  }

  async checkProviderNotVisible(name: string) {
    const accountName = await this.page.getByRole("cell", { name });
    await expect(accountName).not.toBeVisible();
  }

  async checkProviderIsEnabled(name: string) {
    const row = this.page.getByRole("row").filter({ hasText: name });
    const connectedBadge = await row.getByRole("strong");
    expect(connectedBadge).toHaveText("Connected");
  }

  async checkProviderIsDisabled(name: string) {
    const row = this.page.getByRole("row").filter({ hasText: name });
    const disconnectedBadge = await row.getByRole("strong");
    expect(disconnectedBadge).toHaveText("Disconnected");
  }

  async editProvider(name: string) {
    const row = this.page.getByRole("row").filter({ hasText: name });
    await row.getByRole("link", { name: "edit" }).click();
  }

  async createManualBankTransferProvider(name: string) {
    await this.selectManualBankTransferProvider();
    const addManualBankTransferProviderPage =
      new AddManualBankTransferProviderPage(this.page);
    await addManualBankTransferProviderPage.create(name);
  }

  async createOpenBankingProvider(name: string) {
    await this.selectOpenBankingProvider();
    const addOpenBankingProviderPage = new AddOpenBankingProviderPage(
      this.page,
    );
    await addOpenBankingProviderPage.create(name);
  }

  async createStripeProvider(name: string) {
    await this.selectStripeProvider();
    const addStripeProviderPage = new AddStripeProviderPage(this.page);
    await addStripeProviderPage.create(name);
  }

  async createRealexProvider(name: string) {
    await this.selectRealexProvider();
    const addRealexProviderPage = new AddRealexProviderPage(this.page);
    await addRealexProviderPage.create(name);
  }
}
