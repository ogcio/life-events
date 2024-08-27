import { Page } from "@playwright/test";
import { test as base } from "./auth";

type pageFixtures = {
  citizenPage: Page;
  secondCitizenPage: Page;
  publicServantPage: Page;
  secondPublicServantPage: Page;
  inactivePublicServantPage: Page;
};

export const test = base.extend<pageFixtures>({
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

  inactivePublicServantPage: async (
    { browser, inactivePubServantWorkerStorageState },
    use,
  ) => {
    const context = await browser.newContext({
      storageState: inactivePubServantWorkerStorageState,
    });
    const inactivePublicServantPage = await context.newPage();
    await use(inactivePublicServantPage);
    await context.close();
  },
});
