import { Page } from "@playwright/test";
import { test } from "../../fixtures/citizenPagesFixtures";
import {
  Severity,
  owner,
  tags,
  severity,
  description,
} from "allure-js-commons";
import { PaymentRequestsPage } from "../../objects/paymentRequests/PaymentRequestsListPage";
import { PaymentRequestDetailsPage } from "../../objects/paymentRequests/PaymentRequestDetailsPage";
import { mockAmount } from "../../utils/mocks";

test.describe("Transaction with manual bank transfer", () => {
  let page: Page;
  let name: string;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.beforeEach(async () => {
    name = `Test multiple ${Date.now()}`;
  });

  test("should initiate a payment with a manual bank transfer provider @smoke @blocker", async ({
    paymentRequestWithMultipleProviders,
    payPage,
  }) => {
    await description(
      "This test checks that a payment transaction with a manual bank transfer provider is successfully initiated by a citizen",
    );
    await owner("OGCIO");
    await tags("Transaction", "Manual Bank Transfer");
    await severity(Severity.BLOCKER);

    const paymentRequestsPage = new PaymentRequestsPage(page);
    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoDetails(paymentRequestWithMultipleProviders);

    const detailsPage = new PaymentRequestDetailsPage(page);
    const paymentLink = await detailsPage.getPaymentLink();

    await payPage.goto(paymentLink);
    await payPage.checkHeader();
    await payPage.checkAmount(mockAmount);
    await payPage.customAmountForm.checkCustomAmountOptionVisible();
    await payPage.paymentMethodForm.checkPaymentMethodHeader();
    await payPage.paymentMethodForm.checkPaymentMethodVisible("banktransfer");
    await payPage.paymentMethodForm.checkPaymentMethodVisible("openbanking");
    await payPage.paymentMethodForm.checkPaymentMethodVisible("card");
    await payPage.paymentMethodForm.checkButtonEnabled();
  });
});
