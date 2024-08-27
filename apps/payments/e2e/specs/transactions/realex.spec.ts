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
  realexCardData,
} from "../../utils/mocks";
import { PayPage } from "../../objects/payments/PayPage";
import { RealexTransactionPage } from "../../objects/payments/realex/RealexTransactionPage";
import { citizens, myGovIdMockSettings } from "../../utils/constants";

test.describe("Transaction with Realex", () => {
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
    const citizenName = citizens[0];
    const [name, surname] = citizenName.split(" ");
    const citizenEmail = `${name.toLocaleLowerCase()}.${surname.toLocaleLowerCase()}@${myGovIdMockSettings.citizenEmailDomain}`;
    await realexTransactionPage.payerData.enterEmail(citizenEmail);
    await realexTransactionPage.payerData.enterName(citizenName);
    await realexTransactionPage.payerData.enterStreet(mockAddress.street);
    await realexTransactionPage.payerData.enterCountry(mockAddress.country);
    await realexTransactionPage.payerData.enterState(mockAddress.state);
    await realexTransactionPage.payerData.enterCity(mockAddress.city);
    await realexTransactionPage.payerData.enterZIP(mockAddress.ZIP);
    await realexTransactionPage.payerData.enterPhoneNumber(mockPhoneNumber);
    await realexTransactionPage.payerData.continue();
    await realexTransactionPage.cardData.enterCardNumber(realexCardData.number);
    await realexTransactionPage.cardData.enterExpiry(realexCardData.expiry);
    await realexTransactionPage.cardData.enterSecurityCode(realexCardData.code);
    await realexTransactionPage.cardData.enterCardholderName(
      mockAccountHolderName,
    );
    await realexTransactionPage.cardData.pay();
  });
});
