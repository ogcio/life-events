import { test } from "../../fixtures/transactionsFixtures";
import {
  Severity,
  owner,
  tags,
  severity,
  description,
} from "allure-js-commons";
import { CitizenTransactionsPage } from "../../objects/transactions/CitizenTransactionsPage";

test.describe("Citizen transactions page", async () => {
  test("Should create and list a transaction created by a citizen @smoke @blocker", async ({
    manualBankTransferTransaction,
    citizenPage,
  }) => {
    await description(
      "This test checks the listing of transactions created by a citizen",
    );
    await owner("OGCIO");
    await tags("Citizen", "Transaction");
    await severity(Severity.BLOCKER);

    const transactionsPage = new CitizenTransactionsPage(citizenPage);
    await transactionsPage.goto();

    const { paymentRequestTitle, amount, date } = manualBankTransferTransaction;

    await transactionsPage.checkHeader();
    await transactionsPage.checkTransaction(paymentRequestTitle, amount, date);
  });

  test("Should list the transaction only to the user who created it @smoke @blocker", async ({
    manualBankTransferTransaction,
    citizen2Page,
  }) => {
    await description(
      "This test checks that the transaction is not visible to other users",
    );
    await owner("OGCIO");
    await tags("Citizen", "Transaction");
    await severity(Severity.BLOCKER);

    const transactions2Page = new CitizenTransactionsPage(citizen2Page);
    await transactions2Page.goto();

    const { paymentRequestTitle, amount, date } = manualBankTransferTransaction;

    await transactions2Page.checkHeader();
    await transactions2Page.checkTransactionIsMissing(
      paymentRequestTitle,
      amount,
      date,
    );
    await transactions2Page.checkEmptyTransactionsScreen();
  });
});
