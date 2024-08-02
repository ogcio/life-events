import { Page } from "@playwright/test";
import { test } from "../fixtures/test";
import { mockAccountHolderName, mockIban } from "../utils/mocks";
import { paymentSetupUrl } from "../utils/constants";
import { ProvidersPage } from "../objects/providers/ProvidersPage";
import { AddManualBankTransferProviderPage } from "../objects/providers/AddManualBankTransferProviderPage";
import {
  Severity,
  owner,
  tags,
  severity,
  description,
} from "allure-js-commons";

test.describe("Manual bank transfer provider", () => {
  let page: Page;
  let providerName: string;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    providerName = `Test manual bank transfer ${Date.now()}`;
  });

  test("should add a manual bank transfer provider @smoke @critical", async () => {
    await description(
      "This test checks the successful creation of a new manual bank transfer provider.",
    );
    await owner("OGCIO");
    await tags("Providers", "Manual Bank Transfer");
    await severity(Severity.CRITICAL);

    await page.goto(paymentSetupUrl);

    const providersMenuLink = await page.getByRole("link", {
      name: "Providers",
    });
    await providersMenuLink.click();

    const providersPage = new ProvidersPage(page);
    await providersPage.createNewPaymentProvider();
    await providersPage.selectManualBankTransferProvider();

    const addManualBankTransferProviderPage =
      new AddManualBankTransferProviderPage(page);
    await addManualBankTransferProviderPage.enterName(providerName);
    await addManualBankTransferProviderPage.enterAccountHolderName(
      mockAccountHolderName,
    );
    await addManualBankTransferProviderPage.enterIban(mockIban);
    await addManualBankTransferProviderPage.submitProviderCreation();

    await providersPage.checkProviderVisible(providerName);
  });

  test("should not add a manual bank transfer provider if iban in missing @regression @normal", async () => {
    await description(
      "This test checks that a new manual bank transfer provider is not created if iban is missing.",
    );
    await owner("OGCIO");
    await tags("Providers", "Manual Bank Transfer");
    await severity(Severity.NORMAL);

    await page.goto(paymentSetupUrl);

    const providersMenuLink = await page.getByRole("link", {
      name: "Providers",
    });
    await providersMenuLink.click();

    const providersPage = new ProvidersPage(page);
    await providersPage.createNewPaymentProvider();
    await providersPage.selectManualBankTransferProvider();

    const addManualBankTransferProviderPage =
      new AddManualBankTransferProviderPage(page);
    await addManualBankTransferProviderPage.enterName(providerName);
    await addManualBankTransferProviderPage.enterAccountHolderName(
      mockAccountHolderName,
    );
    await addManualBankTransferProviderPage.enterIban("");
    await addManualBankTransferProviderPage.submitProviderCreation();

    await addManualBankTransferProviderPage.expectValidationError(
      "ibanRequired",
    );

    await providersPage.goto();
    await providersPage.checkProviderNotVisible(providerName);
  });

  test("should not add a manual bank transfer provider if account holder name is missing @regression @normal", async () => {
    await description(
      "This test checks that a new manual bank transfer provider is not created if account holder name is missing.",
    );
    await owner("OGCIO");
    await tags("Providers", "Manual Bank Transfer");
    await severity(Severity.NORMAL);

    await page.goto(paymentSetupUrl);

    const providersMenuLink = await page.getByRole("link", {
      name: "Providers",
    });
    await providersMenuLink.click();

    const providersPage = new ProvidersPage(page);
    await providersPage.createNewPaymentProvider();
    await providersPage.selectManualBankTransferProvider();

    const addManualBankTransferProviderPage =
      new AddManualBankTransferProviderPage(page);
    await addManualBankTransferProviderPage.enterName(providerName);
    await addManualBankTransferProviderPage.enterAccountHolderName("");
    await addManualBankTransferProviderPage.enterIban("ABCD");
    await addManualBankTransferProviderPage.submitProviderCreation();

    await addManualBankTransferProviderPage.expectValidationError(
      "accountHolderNameRequired",
    );

    await providersPage.goto();
    await providersPage.checkProviderNotVisible(providerName);
  });

  test("should not add a manual bank transfer provider if iban in invalid @regression @normal", async () => {
    await description(
      "This test checks that a new manual bank transfer provider is not created if an invalid iban is provided.",
    );
    await owner("OGCIO");
    await tags("Providers", "Manual Bank Transfer");
    await severity(Severity.NORMAL);

    await page.goto(paymentSetupUrl);

    const providersMenuLink = await page.getByRole("link", {
      name: "Providers",
    });
    await providersMenuLink.click();

    const providersPage = new ProvidersPage(page);
    await providersPage.createNewPaymentProvider();
    await providersPage.selectManualBankTransferProvider();

    const addManualBankTransferProviderPage =
      new AddManualBankTransferProviderPage(page);
    await addManualBankTransferProviderPage.enterName(providerName);
    await addManualBankTransferProviderPage.enterAccountHolderName(
      mockAccountHolderName,
    );
    await addManualBankTransferProviderPage.enterIban("ABCD");
    await addManualBankTransferProviderPage.submitProviderCreation();

    await addManualBankTransferProviderPage.expectValidationError(
      "ibanInvalid",
    );

    await providersPage.goto();
    await providersPage.checkProviderNotVisible(providerName);
  });
});
