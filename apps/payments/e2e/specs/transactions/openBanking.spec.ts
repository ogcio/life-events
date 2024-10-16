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
import { referenceCodeSearchParam } from "../../utils/constants";
import { PayPage } from "../../objects/payments/PayPage";

export enum TestCases {
  Success = "test_executed",
  Rejected = "test_execution_rejected",
  AuthFailure = "test_authorisation_failed",
}
test.describe("Transaction with open banking", () => {
  test("should cancel a payment with an open banking provider @smoke @normal", async ({
    paymentRequestWithOpenBankingProvider,
    publicServantPage,
    citizenPage,
  }) => {
    await description(
      "This test checks that a payment transaction with an open banking provider can be initiated and then cancelled by a citizen",
    );
    await owner("OGCIO");
    await tags("Transaction", "Open Banking");
    await severity(Severity.NORMAL);

    const paymentRequestsPage = new PaymentRequestsPage(publicServantPage);
    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoDetails(
      paymentRequestWithOpenBankingProvider,
    );

    const detailsPage = new PaymentRequestDetailsPage(publicServantPage);
    const paymentLink = await detailsPage.getPaymentLink();

    const payPage = new PayPage(citizenPage);
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
    const referenceCode = new URL(citizenPage.url()).searchParams.get(
      referenceCodeSearchParam.openBanking,
    ) as unknown as string;

    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoDetails(
      paymentRequestWithOpenBankingProvider,
    );

    await detailsPage.checkPaymentsList([
      { amount: mockAmount, status: "failed", referenceCode },
    ]);
  });

  test("should complete a payment with an open banking provider @smoke @critical", async ({
    paymentRequestWithOpenBankingProvider,
    publicServantPage,
    citizenPage,
  }) => {
    await description(
      "This test checks that a payment transaction with an open banking provider is successfully completed by a citizen",
    );
    await owner("OGCIO");
    await tags("Transaction", "Open Banking");
    await severity(Severity.CRITICAL);

    const paymentRequestsPage = new PaymentRequestsPage(publicServantPage);
    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoDetails(
      paymentRequestWithOpenBankingProvider,
    );

    const detailsPage = new PaymentRequestDetailsPage(publicServantPage);
    const paymentLink = await detailsPage.getPaymentLink();

    const payPage = new PayPage(citizenPage);
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
      TestCases.Success,
    );
    await openBankingTransactionPage.mockBankPortal.enterPin();
    await openBankingTransactionPage.mockBankPortal.continue();
    await openBankingTransactionPage.mockBankPortal.checkSelectAccountTitle();
    await openBankingTransactionPage.mockBankPortal.continue();
    await openBankingTransactionPage.paymentInProgress.checkIsInProgress(
      mockAmount,
    );

    let temporaryRedirectionUrl = "";
    let paymentReferenceCode;
    citizenPage.on("response", async (response) => {
      if (response.status() === 307) {
        temporaryRedirectionUrl = response.url();
        const urlObj = new URL(temporaryRedirectionUrl);
        paymentReferenceCode = urlObj.searchParams.get(
          referenceCodeSearchParam.openBanking,
        );
      }
    });

    await openBankingTransactionPage.paymentInProgress.continue();
    expect(temporaryRedirectionUrl).not.toBeNull();

    await expect(citizenPage.url()).toContain(mockRedirectUrl);
    await expect(
      citizenPage.getByRole("img", { name: "Google" }),
    ).toBeVisible();

    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoDetails(
      paymentRequestWithOpenBankingProvider,
    );

    await detailsPage.checkPaymentsList([
      {
        amount: mockAmount,
        status: "succeeded",
        referenceCode: paymentReferenceCode,
      },
    ]);
  });

  test("should fail a payment in the auth step with an open banking provider @regression @normal", async ({
    paymentRequestWithOpenBankingProvider,
    publicServantPage,
    citizenPage,
  }) => {
    await description(
      "This test checks that a payment transaction with an open banking provider fails if there is an auth failure",
    );
    await owner("OGCIO");
    await tags("Transaction", "Open Banking");
    await severity(Severity.NORMAL);

    const paymentRequestsPage = new PaymentRequestsPage(publicServantPage);
    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoDetails(
      paymentRequestWithOpenBankingProvider,
    );

    const detailsPage = new PaymentRequestDetailsPage(publicServantPage);
    const paymentLink = await detailsPage.getPaymentLink();

    const payPage = new PayPage(citizenPage);
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
      TestCases.AuthFailure,
    );
    await openBankingTransactionPage.mockBankPortal.enterPin();
    await openBankingTransactionPage.mockBankPortal.continue();
    await openBankingTransactionPage.mockBankPortal.checkSelectAccountTitle();
    await openBankingTransactionPage.mockBankPortal.continue();
    await openBankingTransactionPage.paymentAuthorizationFailed.checkIsFailed();
    const referenceCode =
      await openBankingTransactionPage.paymentAuthorizationFailed.getReferenceCode();
    await openBankingTransactionPage.paymentAuthorizationFailed.goBack();

    await expect(
      citizenPage.getByText("There was an error processing your payment."),
    ).toBeVisible();

    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoDetails(
      paymentRequestWithOpenBankingProvider,
    );

    await detailsPage.checkPaymentsList([
      { amount: mockAmount, status: "failed", referenceCode },
    ]);
  });

  test("should fail a payment with an open banking provider rejecting execution @regression @normal", async ({
    paymentRequestWithOpenBankingProvider,
    publicServantPage,
    citizenPage,
  }) => {
    await description(
      "This test checks that a payment transaction with an open banking provider fails if execution is rejected",
    );
    await owner("OGCIO");
    await tags("Transaction", "Open Banking");
    await severity(Severity.NORMAL);

    const paymentRequestsPage = new PaymentRequestsPage(publicServantPage);
    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoDetails(
      paymentRequestWithOpenBankingProvider,
    );

    const detailsPage = new PaymentRequestDetailsPage(publicServantPage);
    const paymentLink = await detailsPage.getPaymentLink();

    const payPage = new PayPage(citizenPage);
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
      TestCases.Rejected,
    );
    await openBankingTransactionPage.mockBankPortal.enterPin();
    await openBankingTransactionPage.mockBankPortal.continue();
    await openBankingTransactionPage.mockBankPortal.checkSelectAccountTitle();
    await openBankingTransactionPage.mockBankPortal.continue();
    await openBankingTransactionPage.paymentRejected.checkIsFailed();
    const referenceCode =
      await openBankingTransactionPage.paymentRejected.getReferenceCode();
    await openBankingTransactionPage.paymentRejected.goBack();

    await expect(
      citizenPage.getByText("There was an error processing your payment."),
    ).toBeVisible();

    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoDetails(
      paymentRequestWithOpenBankingProvider,
    );

    await detailsPage.checkPaymentsList([
      { amount: mockAmount, status: "failed", referenceCode },
    ]);
  });
});
