import { PayPage } from "../objects/payments/PayPage";
import { test as base } from "./paymentRequestsFixtures";

type citizenPagesFixtures = {
  payPage: PayPage;
};

export const test = base.extend<citizenPagesFixtures>({
  payPage: async ({ browser, userWorkerStorageState }, use) => {
    const context = await browser.newContext({
      storageState: userWorkerStorageState,
    });
    const payPage = new PayPage(await context.newPage());
    await use(payPage);
    await context.close();
  },
});
