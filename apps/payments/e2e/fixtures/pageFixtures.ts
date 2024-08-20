import { Page } from "@playwright/test";
import { test as base } from "./auth";

type citizenPageFixtures = {
  citizenPage: Page;
  citizen2Page: Page;
  publicServantPage: Page;
  secondPublicServantPage: Page;
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
    const citizenPage = await context.newPage();
    await use(citizenPage);
    await context.close();
  },

  publicServantPage: async ({ browser, pubServantWorkerStorageState }, use) => {
    const context = await browser.newContext({
      storageState: pubServantWorkerStorageState,
    });
    const publicServantPage = await context.newPage();
    await use(publicServantPage);
    await context.close();
  },

  secondPublicServantPage: async (
    { browser, secondPubServantWorkerStorageState },
    use,
  ) => {
    const context = await browser.newContext({
      storageState: secondPubServantWorkerStorageState,
    });
    const publicServantPage = await context.newPage();
    await use(publicServantPage);
    await context.close();
  },
});
