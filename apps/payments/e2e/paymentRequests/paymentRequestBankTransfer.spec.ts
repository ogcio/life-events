import { Page } from "@playwright/test";
import { test } from "../fixtures/providersFixtures";
import {
  PaymentRequestParams,
  PaymentRequestsPage,
} from "../pages/paymentRequests/PaymentRequestsPage";
import { PaymentRequestDetailsPage } from "../pages/paymentRequests/PaymentRequestDetailsPage";
import { PaymentMethodFormPage } from "../pages/payment/PaymentMethodFormPage";
import { mockAmount } from "../utils/mocks";

test.describe("Payment Request with manual bank transfer provider", () => {
  let page: Page;
  let name: string;

  test.beforeAll(async ({ browser, browserName }) => {
    page = await browser.newPage();
    name = `Test ${browserName} ${new Date()}`;
  });

  test("Create payment request", async ({ bankTransferProvider }) => {
    const paymentRequestsPage = new PaymentRequestsPage(page);
    await paymentRequestsPage.goto();

    const request: PaymentRequestParams = {
      providers: [
        {
          name: bankTransferProvider,
          type: "banktransfer",
        },
      ],
      name,
      allowAmountOverride: true,
      allowCustomAmount: false,
    };
    await paymentRequestsPage.create(request);

    const detailsPage = new PaymentRequestDetailsPage(page);
    await detailsPage.verifyDetails(request);
  });

  test("Verify payment request link", async () => {
    const detailsPage = new PaymentRequestDetailsPage(page);
    await detailsPage.openLink();

    const newAmount = 300;
    const url = page.url();
    const urlWithAmountOverride = `${url}&amount=${newAmount * 100}`;
    await page.goto(urlWithAmountOverride);

    const paymentMethodFormPage = new PaymentMethodFormPage(page);
    await paymentMethodFormPage.verifyAmount(newAmount);
    await paymentMethodFormPage.verifyAvailableMethods(["banktransfer"]);
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
