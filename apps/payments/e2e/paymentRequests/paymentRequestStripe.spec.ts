import { Page } from "@playwright/test";
import { test } from "../fixtures/providersFixtures";
import {
  PaymentRequestParams,
  PaymentRequestsPage,
} from "../pages/paymentRequests/PaymentRequestsPage";
import { PaymentRequestDetailsPage } from "../pages/paymentRequests/PaymentRequestDetailsPage";
import { PaymentMethodFormPage } from "../pages/payment/PaymentMethodFormPage";
import { mockAmount } from "../utils/mocks";

test.describe("Payment Request with stripe provider", () => {
  let page: Page;
  let name: string;

  test.beforeAll(async ({ browser, browserName }) => {
    page = await browser.newPage();
    name = `Test ${browserName} ${new Date()}`;
  });

  test("Create payment request", async ({ stripeProvider }) => {
    const paymentRequestsPage = new PaymentRequestsPage(page);
    await paymentRequestsPage.goto();

    const request: PaymentRequestParams = {
      providers: [
        {
          name: stripeProvider,
          type: "stripe",
        },
      ],
      name,
      allowAmountOverride: false,
      allowCustomAmount: false,
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
    await paymentMethodFormPage.verifyAvailableMethods(["stripe"]);
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
