import { test as base } from "./citizenPageFixtures";
import { PaymentRequestsPage } from "../objects/paymentRequests/PaymentRequestsListPage";
import { PaymentRequestDetailsPage } from "../objects/paymentRequests/PaymentRequestDetailsPage";
import { PayPage } from "../objects/payments/PayPage";
import { ManualBankTransferTransactionPage } from "../objects/payments/ManualBankTransferTransactionPage";
import dayjs from "dayjs";

type transactionFixtures = {
  manualBankTransferTransaction: {
    referenceCode: string;
    date: string;
  };
};

export const test = base.extend<transactionFixtures>({
  manualBankTransferTransaction: async (
    { browser, paymentRequestWithMultipleProviders, citizenPage },
    use,
  ) => {
    const publicServantPage = await browser.newPage();
    const paymentRequestsPage = new PaymentRequestsPage(publicServantPage);
    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoDetails(paymentRequestWithMultipleProviders);

    const detailsPage = new PaymentRequestDetailsPage(publicServantPage);
    const paymentLink = await detailsPage.getPaymentLink();

    const payPage = new PayPage(citizenPage);
    await payPage.goto(paymentLink);
    await payPage.paymentMethodForm.choosePaymentMethod("banktransfer");
    await payPage.paymentMethodForm.proceedToPayment();

    const manualBankTransferTransactionPage =
      new ManualBankTransferTransactionPage(citizenPage);
    const referenceCode =
      await manualBankTransferTransactionPage.getReferenceCode();
    await manualBankTransferTransactionPage.confirmPayment();

    await use({
      referenceCode,
      date: dayjs(new Date()).format("DD/MM/YYYY - HH:mm"),
    });
  },
});
