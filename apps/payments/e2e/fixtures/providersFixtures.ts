import { ProvidersPage } from "../objects/providers/ProvidersPage";
import { test as base } from "./test";

type providersFixtures = {
  realexProvider: string;
  stripeProvider: string;
  openBankingProvider: string;
  bankTransferProvider: string;
};

export const test = base.extend<providersFixtures>({
  realexProvider: async ({ page }, use) => {
    const providersPage = new ProvidersPage(page);
    await providersPage.goto();
    const providerName = `Test realex ${Date.now()}`;
    await providersPage.addProvider(providerName, "realex");
    await use(providerName);
  },

  stripeProvider: async ({ page }, use) => {
    const providersPage = new ProvidersPage(page);
    await providersPage.goto();
    const providerName = `Test stripe ${Date.now()}`;
    await providersPage.addProvider(providerName, "stripe");
    await use(providerName);
  },

  openBankingProvider: async ({ page }, use) => {
    const providersPage = new ProvidersPage(page);
    await providersPage.goto();
    const providerName = `Test open banking ${Date.now()}`;
    await providersPage.addProvider(providerName, "openbanking");
    await use(providerName);
  },

  bankTransferProvider: async ({ page }, use) => {
    const providersPage = new ProvidersPage(page);
    await providersPage.goto();
    const providerName = `Test bank transfer ${Date.now()}`;
    await providersPage.addProvider(providerName, "banktransfer");
    await use(providerName);
  },
});
