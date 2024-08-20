import { Page } from "@playwright/test";
import { test as base } from "./auth";

type citizenPageFixtures = {
  citizenPage: Page;
  secondCitizenPage: Page;
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

  secondCitizenPage: async ({ browser, secondUserWorkerStorageState }, use) => {
    const context = await browser.newContext({
      storageState: secondUserWorkerStorageState,
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
