import { Page } from "@playwright/test";
import { test as base } from "./paymentRequestsFixtures";

type citizenPageFixtures = {
  citizenPage: Page;
  citizen2Page: Page;
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

  citizen2Page: async ({ browser, user2WorkerStorageState }, use) => {
    const context = await browser.newContext({
      storageState: user2WorkerStorageState,
    });
    const citizen2Page = await context.newPage();
    await use(citizen2Page);
    await context.close();
  },
});
