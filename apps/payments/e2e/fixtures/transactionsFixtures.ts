import { test as base } from "./paymentRequestsFixtures";
import { PaymentRequestsPage } from "../objects/paymentRequests/PaymentRequestsListPage";
import { PaymentRequestDetailsPage } from "../objects/paymentRequests/PaymentRequestDetailsPage";
import { PayPage } from "../objects/payments/PayPage";
import { ManualBankTransferTransactionPage } from "../objects/payments/ManualBankTransferTransactionPage";

export type ManualBankTransferTransaction = {
  referenceCode: string;
  amount: string;
  paymentRequestTitle: string;
  status: string;
};

type transactionFixtures = {
  manualBankTransferTransaction: ManualBankTransferTransaction;
};

export const test = base.extend<transactionFixtures>({
  manualBankTransferTransaction: async (
    {
      paymentRequestWithManualBankTransferProvider,
      publicServantPage,
      citizenPage,
    },
    use,
  ) => {
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
    const paymentRequestTitle =
      await manualBankTransferTransactionPage.getPaymentRequestTitle();
    await manualBankTransferTransactionPage.confirmPayment();

    await use({
      referenceCode,
      amount,
      paymentRequestTitle,
      status: "pending",
    });
  },
});
