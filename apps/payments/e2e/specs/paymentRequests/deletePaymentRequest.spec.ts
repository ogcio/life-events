import { test } from "../../fixtures/paymentRequestsFixtures";
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
    paymentRequestWithMultipleProviders,
    browser,
  }) => {
    await description(
      "This test checks the successful deletion of an active payment request when it has no transactions.",
    );
    await owner("OGCIO");
    await tags("Payment Request", "Delete");
    await severity(Severity.MINOR);

    const page = await browser.newPage();
    const paymentRequestsPage = new PaymentRequestsPage(page);
    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoDetails(paymentRequestWithMultipleProviders);

    const detailsPage = new PaymentRequestDetailsPage(page);
    await detailsPage.checkHeader();
    await detailsPage.delete();
    await detailsPage.confirmDelete();

    await paymentRequestsPage.checkRequestIsNotVisible(
      paymentRequestWithMultipleProviders,
    );
  });

  test("should not delete an active payment request when it has transactions @regression @critical", async () => {
    await description(
      "This test checks than active payment request cannot be deleted when it has transactions.",
    );
    await owner("OGCIO");
    await tags("Payment Request", "Delete");
    await severity(Severity.CRITICAL);

    // TODO: will test this when transaction fixture is available
  });
});
