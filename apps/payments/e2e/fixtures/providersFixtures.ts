import { ProvidersPage } from "../objects/providers/ProvidersPage";
import { test as base } from "./pageFixtures";

type providersFixtures = {
  realexProvider: string;
  stripeProvider: string;
  openBankingProvider: string;
  bankTransferProvider: { name: string; id: string };
};

export const test = base.extend<providersFixtures>({
  realexProvider: async ({ publicServantPage }, use) => {
    const providersPage = new ProvidersPage(publicServantPage);
    await providersPage.goto();
    const providerName = `Test realex ${Date.now()}`;
    await providersPage.addProvider(providerName, "realex");
    await use(providerName);
  },

  stripeProvider: async ({ publicServantPage }, use) => {
    const providersPage = new ProvidersPage(publicServantPage);
    await providersPage.goto();
    const providerName = `Test stripe ${Date.now()}`;
    await providersPage.addProvider(providerName, "stripe");
    await use(providerName);
  },

  openBankingProvider: async ({ publicServantPage }, use) => {
    const providersPage = new ProvidersPage(publicServantPage);
    await providersPage.goto();
    const providerName = `Test open banking ${Date.now()}`;
    await providersPage.addProvider(providerName, "openbanking");
    await use(providerName);
  },

  bankTransferProvider: async ({ publicServantPage }, use) => {
    const providersPage = new ProvidersPage(publicServantPage);
    await providersPage.goto();
    const providerName = `Test bank transfer ${Date.now()}`;
    await providersPage.addProvider(providerName, "banktransfer");
    const providerId = await providersPage.getProviderId(providerName);
    await use({ name: providerName, id: providerId });
  },
});
