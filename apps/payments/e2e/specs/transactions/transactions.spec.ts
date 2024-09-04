import { test } from "../../fixtures/transactionsFixtures";
import {
  Severity,
  owner,
  tags,
  severity,
  description,
} from "allure-js-commons";
import { TransactionsListPage } from "../../objects/transactions/TransactionsListPage";
import { citizens, myGovIdMockSettings } from "../../utils/constants";
import { PublicServantTransactionDetailsPage } from "../../objects/transactions/PublicServantTransactionDetailsPage";

test.describe("Public servant transactions view", async () => {
  test("Should create and list a transaction created by a citizen @smoke @normal", async ({
    manualBankTransferTransaction,
    publicServantPage,
  }) => {
    await description(
      "This test checks that a transaction created by a citizen can be viewed by a public servant",
    );
    await owner("OGCIO");
    await tags("Transaction");
    await severity(Severity.NORMAL);

    const transactionsListPage = new TransactionsListPage(publicServantPage, {
      isCitizen: false,
    });
    await transactionsListPage.goto();
    await transactionsListPage.checkHeader();
    await transactionsListPage.checkTransaction(manualBankTransferTransaction);
    await transactionsListPage.gotoDetails(manualBankTransferTransaction);

    const detailsPage = new PublicServantTransactionDetailsPage(
      publicServantPage,
    );
    await detailsPage.checkHeader();
    await detailsPage.checkTitle(
      manualBankTransferTransaction.paymentRequestTitle,
    );
    await detailsPage.checkAmount(manualBankTransferTransaction.amount);
    await detailsPage.checkStatus(manualBankTransferTransaction.status);
    await detailsPage.checkProviderType("banktransfer");
    await detailsPage.checkReferenceCode(
      manualBankTransferTransaction.referenceCode,
    );
    await detailsPage.checkPayerName(citizens[0]);
    const [name, surname] = citizens[0].split(" ");
    const email = `${name.toLocaleLowerCase()}.${surname.toLocaleLowerCase()}@${myGovIdMockSettings.citizenEmailDomain}`;
    await detailsPage.checkPayerMail(email);
  });

  test("Should show the transaction only to public servants in the same organization @smoke @normal", async ({
    manualBankTransferTransaction,
    secondPublicServantPage,
  }) => {
    await description(
      "This test checks that the transaction is not visible to other public servants that don't belong to the same organization",
    );
    await owner("OGCIO");
    await tags("Transaction");
    await severity(Severity.NORMAL);

    const transactionsListPage = new TransactionsListPage(
      secondPublicServantPage,
      { isCitizen: false },
    );
    await transactionsListPage.goto();

    await transactionsListPage.checkHeader();
    await transactionsListPage.checkTransactionIsMissing(
      manualBankTransferTransaction,
    );
    await transactionsListPage.checkEmptyTransactionsScreen();
  });

  test("Should update the status of a manual bank transfer transaction @smoke @critical", async ({
    manualBankTransferTransaction,
    publicServantPage,
  }) => {
    await description(
      "This test checks that a manual bank transfer transaction created by a citizen can be updated by a public servant",
    );
    await owner("OGCIO");
    await tags("Transaction");
    await severity(Severity.CRITICAL);

    const transactionsListPage = new TransactionsListPage(publicServantPage, {
      isCitizen: false,
    });
    await transactionsListPage.goto();
    await transactionsListPage.checkHeader();
    await transactionsListPage.checkTransaction(manualBankTransferTransaction);
    await transactionsListPage.gotoDetails(manualBankTransferTransaction);

    const detailsPage = new PublicServantTransactionDetailsPage(
      publicServantPage,
    );
    await detailsPage.checkHeader();
    await detailsPage.checkStatus(manualBankTransferTransaction.status);
    await detailsPage.confirmTransaction();
    await transactionsListPage.goto();
    await transactionsListPage.checkTransaction({
      ...manualBankTransferTransaction,
      status: "succeeded",
    });
  });
});
