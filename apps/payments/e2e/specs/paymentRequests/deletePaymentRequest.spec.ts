import { test } from "../../fixtures/transactionsFixtures";
import {
  Severity,
  owner,
  tags,
  severity,
  description,
} from "allure-js-commons";
import { PaymentRequestsPage } from "../../objects/paymentRequests/PaymentRequestsListPage";

import { PaymentRequestDetailsPage } from "../../objects/paymentRequests/PaymentRequestDetailsPage";

test.describe("Payment Request deletion", () => {
  test("should delete an active payment request when it has no transactions @regression @minor", async ({
    paymentRequestWithOpenBankingProvider,
    publicServantPage,
  }) => {
    await description(
      "This test checks the successful deletion of an active payment request when it has no transactions.",
    );
    await owner("OGCIO");
    await tags("Payment Request", "Delete");
    await severity(Severity.MINOR);

    const paymentRequestsPage = new PaymentRequestsPage(publicServantPage);
    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoDetails(
      paymentRequestWithOpenBankingProvider,
    );

    const detailsPage = new PaymentRequestDetailsPage(publicServantPage);
    await detailsPage.checkHeader();
    await detailsPage.delete();
    await detailsPage.confirmDelete();

    await paymentRequestsPage.checkRequestIsNotVisible(
      paymentRequestWithOpenBankingProvider,
    );
  });

  test("should not delete an active payment request when it has transactions @regression @critical", async ({
    paymentRequestWithManualBankTransferProvider,
    manualBankTransferTransaction,
    publicServantPage,
  }) => {
    await description(
      "This test checks than active payment request cannot be deleted when it has transactions.",
    );
    await owner("OGCIO");
    await tags("Payment Request", "Delete");
    await severity(Severity.CRITICAL);

    const paymentRequestsPage = new PaymentRequestsPage(publicServantPage);
    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoDetails(
      paymentRequestWithManualBankTransferProvider,
    );

    const detailsPage = new PaymentRequestDetailsPage(publicServantPage);
    await detailsPage.checkHeader();
    await detailsPage.checkPaymentsList([manualBankTransferTransaction]);
    await detailsPage.checkDeleteDisabled();
  });
});
