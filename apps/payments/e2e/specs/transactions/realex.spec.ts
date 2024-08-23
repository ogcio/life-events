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
import { mockAddress, mockAmount, mockPhoneNumber } from "../../utils/mocks";
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
    await realexTransactionPage.chooseManualCheckout();
    const citizenName = citizens[0];
    const [name, surname] = citizenName.split(" ");
    const citizenEmail = `${name.toLocaleLowerCase()}.${surname.toLocaleLowerCase()}@${myGovIdMockSettings.citizenEmailDomain}`;
    await realexTransactionPage.PayerData.enterEmail(citizenEmail);
    await realexTransactionPage.PayerData.enterName(citizenName);
    await realexTransactionPage.PayerData.enterStreet(mockAddress.street);
    await realexTransactionPage.PayerData.enterCountry(mockAddress.country);
    await realexTransactionPage.PayerData.enterState(mockAddress.state);
    await realexTransactionPage.PayerData.enterCity(mockAddress.city);
    await realexTransactionPage.PayerData.enterZIP(mockAddress.ZIP);
    await realexTransactionPage.PayerData.enterPhoneNumber(mockPhoneNumber);
    await realexTransactionPage.continue();
  });
});
