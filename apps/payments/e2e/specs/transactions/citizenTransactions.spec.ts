import { test } from "../../fixtures/transactionsFixtures";
import {
  Severity,
  owner,
  tags,
  severity,
  description,
} from "allure-js-commons";
import { CitizenTransactionsPage } from "../../objects/transactions/CitizenTransactionsPage";
import { CitizenTransactionDetailsPage } from "../../objects/transactions/CitizenTransactionDetailsPage";
import { myGovIdMockSettings } from "../../utils/constants";

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

    await transactionsPage.checkHeader();
    await transactionsPage.checkTransaction(manualBankTransferTransaction);
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

    await transactions2Page.checkHeader();
    await transactions2Page.checkTransactionIsMissing(
      manualBankTransferTransaction,
    );
    await transactions2Page.checkEmptyTransactionsScreen();
  });

  test("Should show the transaction's details @smoke @blocker", async ({
    manualBankTransferTransaction,
    citizenPage,
  }) => {
    await description(
      "This test checks if the user can view the transaction's details",
    );
    await owner("OGCIO");
    await tags("Citizen", "Transaction");
    await severity(Severity.BLOCKER);

    const transactionsPage = new CitizenTransactionsPage(citizenPage);
    await transactionsPage.goto();

    const detailsPage = new CitizenTransactionDetailsPage(citizenPage);
    await detailsPage.goto(manualBankTransferTransaction);
    await detailsPage.checkHeader();
    await detailsPage.checkTitle(
      manualBankTransferTransaction.paymentRequestTitle,
    );
    await detailsPage.checkAmount(manualBankTransferTransaction.amount);
    // await detailsPage.checkLastUpdate(manualBankTransferTransaction.lastUpdated); // FIX IT
    await detailsPage.checkStatus("pending");
    await detailsPage.checkProviderType("Bank Transfer");
    await detailsPage.checkReferenceCode(
      manualBankTransferTransaction.referenceCode,
    );
    await detailsPage.checkPayerName(myGovIdMockSettings.citizen);
    await detailsPage.checkPayerMail(myGovIdMockSettings.citizenEmail);
  });
});
