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
import {
  mockAccountHolderName,
  mockAmount,
  mockRedirectUrl,
} from "../../utils/mocks";
import { TrueLayerDialogPage } from "../../objects/payments/openbanking/TrueLayerDialogPage";
import { expect } from "@playwright/test";
import { PayPage } from "../../objects/payments/PayPage";
import { StripeForm } from "../../objects/payments/stripe/StripeForm";

test.describe("Transaction with stripe", () => {
  test("should complete a payment with Stripe provider @smoke @critical", async ({
    paymentRequestWithStripeProvider,
    publicServantPage,
    citizenPage,
  }) => {
    await description(
      "This test checks that a payment transaction with Stripe provider is successfully completed by a citizen",
    );
    await owner("OGCIO");
    await tags("Transaction", "Stripe");
    await severity(Severity.CRITICAL);

    const paymentRequestsPage = new PaymentRequestsPage(publicServantPage);
    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoDetails(paymentRequestWithStripeProvider);

    const detailsPage = new PaymentRequestDetailsPage(publicServantPage);
    const paymentLink = await detailsPage.getPaymentLink();

    const payPage = new PayPage(citizenPage);
    await payPage.goto(paymentLink);
    await payPage.checkHeader();
    await payPage.checkAmount(mockAmount);
    await payPage.customAmountForm.checkCustomAmountOptionVisible();
    await payPage.paymentMethodForm.checkPaymentMethodHeader();
    await payPage.paymentMethodForm.checkPaymentMethodVisible("card");
    await payPage.paymentMethodForm.checkButtonEnabled();
    await payPage.paymentMethodForm.choosePaymentMethod("card");
    await payPage.paymentMethodForm.proceedToPayment();

    const stripe = new StripeForm(citizenPage);
    await stripe.checkForm();

    // TODO: check transaction status
  });
});
