import { Page, expect } from "@playwright/test";
import { test } from "../fixtures/providersFixtures";
import {
  PaymentRequestParams,
  PaymentRequestsPage,
} from "../pages/paymentRequests/PaymentRequestsPage";
import { PaymentRequestDetailsPage } from "../pages/paymentRequests/PaymentRequestDetailsPage";
import { PaymentMethodFormPage } from "../pages/payment/PaymentMethodFormPage";
import { mockAmount } from "../utils/mocks";

test.describe("Payment Request with open banking provider", () => {
  let page: Page;
  let name: string;

  test.beforeAll(async ({ browser, browserName }) => {
    page = await browser.newPage();
    name = `Test ${browserName} ${new Date()}`;
  });

  test("Create payment request", async ({ openBankingProvider }) => {
    const paymentRequestsPage = new PaymentRequestsPage(page);
    await paymentRequestsPage.goto();

    const request: PaymentRequestParams = {
      providers: [
        {
          name: openBankingProvider,
          type: "openbanking",
        },
      ],
      name,
      allowAmountOverride: false,
      allowCustomAmount: true,
    };
    await paymentRequestsPage.create(request);

    const detailsPage = new PaymentRequestDetailsPage(page);
    await detailsPage.verifyDetails(request);
  });

  test("Verify payment request link", async () => {
    const detailsPage = new PaymentRequestDetailsPage(page);
    await detailsPage.openLink();
    const paymentMethodFormPage = new PaymentMethodFormPage(page);
    await paymentMethodFormPage.verifyAmount(mockAmount);
    await paymentMethodFormPage.verifyAvailableMethods(["openbanking"]);
    await paymentMethodFormPage.verifyCustomAmount();
    const newAmount = 20;
    await paymentMethodFormPage.changeAmount(newAmount);
    await paymentMethodFormPage.verifyAmount(newAmount);
    await page.goBack();
    await page.goBack();
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
