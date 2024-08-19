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
import { mockAccountHolderName, mockAmount } from "../../utils/mocks";
import { TrueLayerDialogPage } from "../../objects/payments/openbanking/TrueLayerDialogPage";

test.describe("Transaction with open banking", () => {
  test("should cancel a payment with an open banking provider @smoke @critical", async ({
    browser,
    paymentRequestWithOpenBankingProvider,
    payPage,
  }) => {
    await description(
      "This test checks that a payment transaction with an open banking provider can be initiated and then cancelled by a citizen",
    );
    await owner("OGCIO");
    await tags("Transaction", "Open Banking");
    await severity(Severity.CRITICAL);

    const publicServantPage = await browser.newPage();
    const paymentRequestsPage = new PaymentRequestsPage(publicServantPage);
    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoDetails(
      paymentRequestWithOpenBankingProvider,
    );

    const detailsPage = new PaymentRequestDetailsPage(publicServantPage);
    const paymentLink = await detailsPage.getPaymentLink();

    const citizenPage = payPage.page;
    await payPage.goto(paymentLink);
    await payPage.checkHeader();
    await payPage.checkAmount(mockAmount);
    await payPage.customAmountForm.checkCustomAmountOptionVisible();
    await payPage.paymentMethodForm.checkPaymentMethodHeader();
    await payPage.paymentMethodForm.checkPaymentMethodVisible("openbanking");
    await payPage.paymentMethodForm.checkButtonEnabled();
    await payPage.paymentMethodForm.choosePaymentMethod("openbanking");
    await payPage.paymentMethodForm.proceedToPayment();

    const openBankingTransactionPage = new TrueLayerDialogPage(citizenPage);
    await openBankingTransactionPage.checkLoader();
    await openBankingTransactionPage.countrySelection.checkHeader();
    await openBankingTransactionPage.countrySelection.chooseIreland();
    await openBankingTransactionPage.cancelPayment();

    // TODO: proceed with cancel page
  });

  test("should initiate a payment with an open banking provider @smoke @critical", async ({
    browser,
    paymentRequestWithOpenBankingProvider,
    payPage,
  }) => {
    await description(
      "This test checks that a payment transaction with an open banking provider is successfully initiated by a citizen",
    );
    await owner("OGCIO");
    await tags("Transaction", "Open Banking");
    await severity(Severity.CRITICAL);

    const publicServantPage = await browser.newPage();
    const paymentRequestsPage = new PaymentRequestsPage(publicServantPage);
    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoDetails(
      paymentRequestWithOpenBankingProvider,
    );

    const detailsPage = new PaymentRequestDetailsPage(publicServantPage);
    const paymentLink = await detailsPage.getPaymentLink();

    const citizenPage = payPage.page;
    await payPage.goto(paymentLink);
    await payPage.checkHeader();
    await payPage.checkAmount(mockAmount);
    await payPage.customAmountForm.checkCustomAmountOptionVisible();
    await payPage.paymentMethodForm.checkPaymentMethodHeader();
    await payPage.paymentMethodForm.checkPaymentMethodVisible("openbanking");
    await payPage.paymentMethodForm.checkButtonEnabled();
    await payPage.paymentMethodForm.choosePaymentMethod("openbanking");
    await payPage.paymentMethodForm.proceedToPayment();

    const openBankingTransactionPage = new TrueLayerDialogPage(citizenPage);
    await openBankingTransactionPage.checkLoader();
    await openBankingTransactionPage.countrySelection.checkHeader();
    await openBankingTransactionPage.countrySelection.chooseIreland();
    await openBankingTransactionPage.bankSelection.checkHeader();
    await openBankingTransactionPage.bankSelection.chooseMockBank();
    await openBankingTransactionPage.reviewPayment.checkPayment({
      amount: mockAmount,
      accountHolder: mockAccountHolderName,
    });
    await openBankingTransactionPage.reviewPayment.proceed();

    // TODO: leave flow
  });
});
