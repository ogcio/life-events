import { ProvidersPage } from "../pages/providers/ProvidersPage";
import { test as base } from "./test";

type providersFixtures = {
  stripeProvider: string;
};

export const test = base.extend<providersFixtures>({
  stripeProvider: async ({ page, browserName }, use) => {
    const providersPage = new ProvidersPage(page);
    await providersPage.goto();
    const providerName = `Test stripe ${browserName} ${new Date()}`;
    await providersPage.addProvider(providerName, "stripe");
    await use(providerName);
  },
});
