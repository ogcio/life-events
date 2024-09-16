import { test } from "../../fixtures/transactionsFixtures";
import {
  Severity,
  owner,
  tags,
  severity,
  description,
} from "allure-js-commons";
import { TransactionsListPage } from "../../objects/transactions/TransactionsListPage";
import { CitizenTransactionDetailsPage } from "../../objects/transactions/CitizenTransactionDetailsPage";
import { citizens, myGovIdMockSettings } from "../../utils/constants";

test.describe("Citizen transactions page", async () => {
  test("Should create and list a transaction created by a citizen @smoke @normal", async ({
    manualBankTransferTransaction,
    citizenPage,
  }) => {
    await description(
      "This test checks the listing of transactions created by a citizen",
    );
    await owner("OGCIO");
    await tags("Citizen", "Transaction");
    await severity(Severity.NORMAL);

    const transactionsPage = new TransactionsListPage(citizenPage, {
      isCitizen: true,
    });
    await transactionsPage.goto();

    await transactionsPage.checkHeader();
    await transactionsPage.checkTransaction(manualBankTransferTransaction);
  });

  test("Should list the transaction only to the user who created it @smoke @normal", async ({
    manualBankTransferTransaction,
    secondCitizenPage,
  }) => {
    await description(
      "This test checks that the transaction is not visible to other users",
    );
    await owner("OGCIO");
    await tags("Citizen", "Transaction");
    await severity(Severity.NORMAL);

    const transactions2Page = new TransactionsListPage(secondCitizenPage, {
      isCitizen: true,
    });
    await transactions2Page.goto();

    await transactions2Page.checkHeader();
    await transactions2Page.checkTransactionIsMissing(
      manualBankTransferTransaction,
    );
    await transactions2Page.checkEmptyTransactionsScreen();
  });

  test("Should show the transaction's details @smoke @normal", async ({
    manualBankTransferTransaction,
    citizenPage,
  }) => {
    await description(
      "This test checks if the user can view the transaction's details",
    );
    await owner("OGCIO");
    await tags("Citizen", "Transaction");
    await severity(Severity.NORMAL);

    const transactionsPage = new TransactionsListPage(citizenPage, {
      isCitizen: true,
    });
    await transactionsPage.goto();

    const detailsPage = new CitizenTransactionDetailsPage(citizenPage);
    await detailsPage.goto(manualBankTransferTransaction);
    await detailsPage.checkHeader();
    await detailsPage.checkTitle(
      manualBankTransferTransaction.paymentRequestTitle,
    );
    await detailsPage.checkAmount(manualBankTransferTransaction.amount);
    await detailsPage.checkStatus(manualBankTransferTransaction.status);
    await detailsPage.checkProviderType("Bank Transfer");
    await detailsPage.checkReferenceCode(
      manualBankTransferTransaction.referenceCode,
    );
    await detailsPage.checkPayerName(citizens[0]);
    const [name, surname] = citizens[0].split(" ");
    const email = `${name.toLocaleLowerCase()}.${surname.toLocaleLowerCase()}@${myGovIdMockSettings.citizenEmailDomain}`;
    await detailsPage.checkPayerMail(email);
  });
});
