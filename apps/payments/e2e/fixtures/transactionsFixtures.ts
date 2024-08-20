import { test as base } from "./citizenPageFixtures";
import { PaymentRequestsPage } from "../objects/paymentRequests/PaymentRequestsListPage";
import { PaymentRequestDetailsPage } from "../objects/paymentRequests/PaymentRequestDetailsPage";
import { PayPage } from "../objects/payments/PayPage";
import { ManualBankTransferTransactionPage } from "../objects/payments/ManualBankTransferTransactionPage";
import dayjs from "dayjs";

type transactionFixtures = {
  manualBankTransferTransaction: {
    referenceCode: string;
    amount: string;
    status: string;
    date: string;
  };
};

export const test = base.extend<transactionFixtures>({
  manualBankTransferTransaction: async (
    { browser, paymentRequestWithManualBankTransferProvider, citizenPage },
    use,
  ) => {
    const publicServantPage = await browser.newPage();
    const paymentRequestsPage = new PaymentRequestsPage(publicServantPage);
    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoDetails(
      paymentRequestWithManualBankTransferProvider,
    );

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
    const amount = await manualBankTransferTransactionPage.getAmount();
    await manualBankTransferTransactionPage.confirmPayment();

    await use({
      referenceCode,
      amount,
      status: "pending",
      date: dayjs(new Date()).format("DD/MM/YYYY - HH:mm"),
    });
  },
});
