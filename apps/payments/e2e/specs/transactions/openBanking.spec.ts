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
import {
  mockAccountHolderName,
  mockAmount,
  mockRedirectUrl,
} from "../../utils/mocks";
import { TrueLayerDialogPage } from "../../objects/payments/openbanking/TrueLayerDialogPage";
import { expect } from "@playwright/test";

test.describe("Transaction with open banking", () => {
  test("should cancel a payment with an open banking provider @smoke @normal", async ({
    browser,
    paymentRequestWithOpenBankingProvider,
    payPage,
  }) => {
    await description(
      "This test checks that a payment transaction with an open banking provider can be initiated and then cancelled by a citizen",
    );
    await owner("OGCIO");
    await tags("Transaction", "Open Banking");
    await severity(Severity.NORMAL);

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
    await openBankingTransactionPage.cancelPaymentComponent.proceedAndCancelPayment();

    await expect(
      citizenPage.getByText("There was an error processing your payment."),
    ).toBeVisible();

    // TODO: check transaction status
  });

  test("should initiate a payment with an open banking provider and then abort it @smoke @normal", async ({
    browser,
    paymentRequestWithOpenBankingProvider,
    payPage,
  }) => {
    await description(
      "This test checks that a payment transaction with an open banking provider is successfully canceled if a citizen initiate it and then leaves the flow",
    );
    await owner("OGCIO");
    await tags("Transaction", "Open Banking");
    await severity(Severity.NORMAL);

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

    await citizenPage.goBack();
    await payPage.checkHeader();

    // TODO: check transaction status
  });

  test("should complete a payment with an open banking provider @smoke @critical", async ({
    browser,
    paymentRequestWithOpenBankingProvider,
    payPage,
  }) => {
    await description(
      "This test checks that a payment transaction with an open banking provider is successfully completed by a citizen",
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
    await openBankingTransactionPage.payWithPhone.proceedToPayment();
    await openBankingTransactionPage.mockBankPortal.checkPortalTitle();
    await openBankingTransactionPage.mockBankPortal.enterUserName(
      "test_executed",
    );
    await openBankingTransactionPage.mockBankPortal.enterPin();
    await openBankingTransactionPage.mockBankPortal.continue();
    await openBankingTransactionPage.mockBankPortal.checkSelectAccountTitle();
    await openBankingTransactionPage.mockBankPortal.continue();
    await openBankingTransactionPage.paymentInProgress.checkIsInProgress(
      mockAmount,
    );
    await openBankingTransactionPage.paymentInProgress.continue();

    await expect(citizenPage.url()).toContain(mockRedirectUrl);
    await expect(
      citizenPage.getByRole("img", { name: "Google" }),
    ).toBeVisible();

    // TODO: check transaction status
  });
});
