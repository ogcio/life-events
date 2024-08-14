import { Page } from "@playwright/test";
import { PayPage } from "../objects/payments/PayPage";
import { test as base } from "./paymentRequestsFixtures";

type citizenPageFixtures = {
  payPage: PayPage;
  citizenPage: Page;
};

export const test = base.extend<citizenPageFixtures>({
  citizenPage: async ({ browser, userWorkerStorageState }, use) => {
    const context = await browser.newContext({
      storageState: userWorkerStorageState,
    });
    const citizenPage = await context.newPage();
    await use(citizenPage);
    await context.close();
  },
});
