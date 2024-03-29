import { Page } from "@playwright/test";
import { test } from "../fixtures/providersFixtures";
import {
  PaymentRequestParams,
  PaymentRequestsPage,
} from "../pages/paymentRequests/PaymentRequestsPage";
import { PaymentRequestDetailsPage } from "../pages/paymentRequests/PaymentRequestDetailsPage";

test.describe("Payment Request with multiple providers", () => {
  let page: Page;
  let name: string;

  test.beforeAll(async ({ browser, browserName }) => {
    page = await browser.newPage();
    name = `Test ${browserName} ${new Date()}`;
  });

  test("Create payment request", async ({
    bankTransferProvider,
    openBankingProvider,
    stripeProvider,
  }) => {
    const paymentRequestsPage = new PaymentRequestsPage(page);
    await paymentRequestsPage.goto();

    const request: PaymentRequestParams = {
      providers: [
        {
          name: bankTransferProvider,
          type: "banktransfer",
        },
        {
          name: openBankingProvider,
          type: "openbanking",
        },
        {
          name: stripeProvider,
          type: "stripe",
        },
      ],
      name,
      allowAmountOverride: true,
      allowCustomAmount: true,
    };
    await paymentRequestsPage.create(request);

    const detailsPage = new PaymentRequestDetailsPage(page);
    await detailsPage.verifyDetails(request);
  });

  test("Edit payment request", async () => {
    const detailsPage = new PaymentRequestDetailsPage(page);
    name = `${name} edited`;
    await detailsPage.edit(name);
  });

  test("Delete payment request", async () => {
    const detailsPage = new PaymentRequestDetailsPage(page);
    await detailsPage.delete();
    const paymentRequestsPage = new PaymentRequestsPage(page);
    await paymentRequestsPage.verifyDeleted(name);
  });
});
