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
  mockAddress,
  mockAmount,
  mockPhoneNumber,
  mockRedirectUrl,
  realexCardData,
} from "../../utils/mocks";
import { PayPage } from "../../objects/payments/PayPage";
import { RealexTransactionPage } from "../../objects/payments/realex/RealexTransactionPage";
import {
  citizens,
  myGovIdMockSettings,
  referenceCodeSearchParam,
} from "../../utils/constants";
import { expect } from "@playwright/test";
import { startNgrok } from "../../utils/start-ngrok";
import { stopNgrok } from "../../utils/stop-ngrok";

test.describe("Transaction with Realex", () => {
  const citizenName = citizens[0];
  const [name, surname] = citizenName.split(" ");
  const citizenEmail = `${name.toLocaleLowerCase()}.${surname.toLocaleLowerCase()}@${myGovIdMockSettings.citizenEmailDomain}`;

  test.beforeAll(async () => await startNgrok());

  test.afterAll(async () => await stopNgrok());

  test("should complete a payment with a realex provider @smoke @critical", async ({
    publicServantPage,
    paymentRequestWithRealexProvider,
    citizenPage,
  }) => {
    await description(
      "This test checks that a payment transaction with a realex provider is successfully completed by a citizen",
    );
    await owner("OGCIO");
    await tags("Transaction", "Realex");
    await severity(Severity.CRITICAL);

    const paymentRequestsPage = new PaymentRequestsPage(publicServantPage);
    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoDetails(paymentRequestWithRealexProvider);

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

    const realexTransactionPage = new RealexTransactionPage(citizenPage);
    await realexTransactionPage.checkHeader();
    await citizenPage.waitForLoadState("networkidle");
    await realexTransactionPage.chooseManualCheckout();
    await realexTransactionPage.payerData.enterEmail(citizenEmail);
    await realexTransactionPage.payerData.enterName(citizenName);
    await realexTransactionPage.payerData.enterStreet(mockAddress.street);
    await realexTransactionPage.payerData.enterCountry(mockAddress.country);
    await realexTransactionPage.payerData.enterState(mockAddress.state);
    await realexTransactionPage.payerData.enterCity(mockAddress.city);
    await realexTransactionPage.payerData.enterZIP(mockAddress.ZIP);
    await realexTransactionPage.payerData.enterPhoneNumber(mockPhoneNumber);
    await realexTransactionPage.payerData.continue();
    await realexTransactionPage.cardData.enterCardNumber(
      realexCardData.successNumber,
    );
    await realexTransactionPage.cardData.enterExpiry(realexCardData.expiry);
    await realexTransactionPage.cardData.enterSecurityCode(realexCardData.code);
    await realexTransactionPage.cardData.enterCardholderName(
      mockAccountHolderName,
    );

    let temporaryRedirectionUrl = "";
    let paymentReferenceCode;
    citizenPage.on("response", async (response) => {
      if (response.status() === 307) {
        temporaryRedirectionUrl = response.url();
        const urlObj = new URL(temporaryRedirectionUrl);
        paymentReferenceCode = urlObj.searchParams.get(
          referenceCodeSearchParam.realex,
        );
      }
    });

    await realexTransactionPage.cardData.pay();

    await expect(
      citizenPage.getByRole("img", { name: "Google" }),
    ).toBeVisible();
    await expect(citizenPage.url()).toContain(mockRedirectUrl);

    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoDetails(paymentRequestWithRealexProvider);

    await detailsPage.checkPaymentsList([
      {
        amount: mockAmount,
        status: "succeeded",
        referenceCode: paymentReferenceCode,
      },
    ]);
  });

  test("should fail a payment with a realex provider @smoke @critical", async ({
    publicServantPage,
    paymentRequestWithRealexProvider,
    citizenPage,
  }) => {
    await description(
      "This test checks that a payment transaction with a realex provider fails if the payment is declined by the bank",
    );
    await owner("OGCIO");
    await tags("Transaction", "Realex");
    await severity(Severity.CRITICAL);

    const paymentRequestsPage = new PaymentRequestsPage(publicServantPage);
    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoDetails(paymentRequestWithRealexProvider);

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

    const realexTransactionPage = new RealexTransactionPage(citizenPage);
    await realexTransactionPage.checkHeader();
    await citizenPage.waitForLoadState("networkidle");
    await realexTransactionPage.chooseManualCheckout();
    await realexTransactionPage.payerData.enterEmail(citizenEmail);
    await realexTransactionPage.payerData.enterName(citizenName);
    await realexTransactionPage.payerData.enterStreet(mockAddress.street);
    await realexTransactionPage.payerData.enterCountry(mockAddress.country);
    await realexTransactionPage.payerData.enterState(mockAddress.state);
    await realexTransactionPage.payerData.enterCity(mockAddress.city);
    await realexTransactionPage.payerData.enterZIP(mockAddress.ZIP);
    await realexTransactionPage.payerData.enterPhoneNumber(mockPhoneNumber);
    await realexTransactionPage.payerData.continue();
    await realexTransactionPage.cardData.enterCardNumber(
      realexCardData.failNumber,
    );
    await realexTransactionPage.cardData.enterExpiry(realexCardData.expiry);
    await realexTransactionPage.cardData.enterSecurityCode(realexCardData.code);
    await realexTransactionPage.cardData.enterCardholderName(
      mockAccountHolderName,
    );

    let temporaryRedirectionUrl = "";
    let paymentReferenceCode;
    citizenPage.on("response", async (response) => {
      if (response.url().includes("/paymentRequest/complete")) {
        temporaryRedirectionUrl = response.url();
        const urlObj = new URL(temporaryRedirectionUrl);
        paymentReferenceCode = urlObj.searchParams.get(
          referenceCodeSearchParam.realex,
        );
      }
    });
    await realexTransactionPage.cardData.pay();

    await expect(
      citizenPage.getByText("There was an error processing your payment."),
    ).toBeVisible();

    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoDetails(paymentRequestWithRealexProvider);

    await detailsPage.checkPaymentsList([
      {
        amount: mockAmount,
        status: "failed",
        referenceCode: paymentReferenceCode,
      },
    ]);
  });
});
