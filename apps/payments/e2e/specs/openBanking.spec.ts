import { Page } from "@playwright/test";
import { test } from "../fixtures/test";
import { mockAccountHolderName, mockIban } from "../utils/mocks";
import { paymentSetupUrl } from "../utils/constants";
import { ProvidersPage } from "../objects/providers/ProvidersPage";
import {
  Severity,
  owner,
  tags,
  severity,
  description,
} from "allure-js-commons";
import { AddOpenBankingProviderPage } from "../objects/providers/AddOpenBankingProviderPage";

test.describe("Open Banking provider", () => {
  let page: Page;
  let providerName: string;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.beforeEach(async () => {
    providerName = `Test open banking ${Date.now()}`;
  });

  test("should add an open banking provider @smoke @critical", async () => {
    console.log("providerName 1", providerName);
    await description(
      "This test checks the successful creation of a new open banking provider.",
    );
    await owner("OGCIO");
    await tags("Providers", "Open Banking");
    await severity(Severity.CRITICAL);

    await page.goto(paymentSetupUrl);

    const providersMenuLink = await page.getByRole("link", {
      name: "Providers",
    });
    await providersMenuLink.click();

    const providersPage = new ProvidersPage(page);
    await providersPage.createNewPaymentProvider();
    await providersPage.selectOpenBankingProvider();

    const addOpenBankingProviderPage = new AddOpenBankingProviderPage(page);
    await addOpenBankingProviderPage.enterName(providerName);
    await addOpenBankingProviderPage.enterAccountHolderName(
      mockAccountHolderName,
    );
    await addOpenBankingProviderPage.enterIban(mockIban);
    await addOpenBankingProviderPage.submitProviderCreation();

    await providersPage.checkProviderVisible(providerName);
  });

  test("should not add an open banking provider if iban in missing @regression @normal", async () => {
    console.log("providerName 2", providerName);
    await description(
      "This test checks that a new open banking provider is not created if iban is missing.",
    );
    await owner("OGCIO");
    await tags("Providers", "Open Banking");
    await severity(Severity.NORMAL);

    await page.goto(paymentSetupUrl);

    const providersMenuLink = await page.getByRole("link", {
      name: "Providers",
    });
    await providersMenuLink.click();

    const providersPage = new ProvidersPage(page);
    await providersPage.createNewPaymentProvider();
    await providersPage.selectOpenBankingProvider();

    const addOpenBankingProviderPage = new AddOpenBankingProviderPage(page);
    await addOpenBankingProviderPage.enterName(providerName);
    await addOpenBankingProviderPage.enterAccountHolderName(
      mockAccountHolderName,
    );
    await addOpenBankingProviderPage.enterIban("");
    await addOpenBankingProviderPage.submitProviderCreation();

    await addOpenBankingProviderPage.expectValidationError("ibanRequired");

    await providersPage.goto();
    await providersPage.checkProviderNotVisible(providerName);
  });

  test("should not add an open banking provider if account holder name is missing @regression @normal", async () => {
    console.log("providerName 3", providerName);
    await description(
      "This test checks that a new open banking provider is not created if account holder name is missing.",
    );
    await owner("OGCIO");
    await tags("Providers", "Open Banking");
    await severity(Severity.NORMAL);

    await page.goto(paymentSetupUrl);

    const providersMenuLink = await page.getByRole("link", {
      name: "Providers",
    });
    await providersMenuLink.click();

    const providersPage = new ProvidersPage(page);
    await providersPage.createNewPaymentProvider();
    await providersPage.selectOpenBankingProvider();

    const addOpenBankingProviderPage = new AddOpenBankingProviderPage(page);
    await addOpenBankingProviderPage.enterName(providerName);
    await addOpenBankingProviderPage.enterAccountHolderName("");
    await addOpenBankingProviderPage.enterIban(mockIban);
    await addOpenBankingProviderPage.submitProviderCreation();

    await addOpenBankingProviderPage.expectValidationError(
      "accountHolderNameRequired",
    );

    await providersPage.goto();
    await providersPage.checkProviderNotVisible(providerName);
  });

  test("should not add a manual bank transfer provider if iban in invalid @regression @normal", async () => {
    console.log("providerName 4", providerName);
    await description(
      "This test checks that a new manual bank transfer provider is not created if an invalid iban is provided.",
    );
    await owner("OGCIO");
    await tags("Providers", "Open Banking");
    await severity(Severity.NORMAL);

    await page.goto(paymentSetupUrl);

    const providersMenuLink = await page.getByRole("link", {
      name: "Providers",
    });
    await providersMenuLink.click();

    const providersPage = new ProvidersPage(page);
    await providersPage.createNewPaymentProvider();
    await providersPage.selectOpenBankingProvider();

    const addOpenBankingProviderPage = new AddOpenBankingProviderPage(page);
    await addOpenBankingProviderPage.enterName(providerName);
    await addOpenBankingProviderPage.enterAccountHolderName(
      mockAccountHolderName,
    );
    await addOpenBankingProviderPage.enterIban("ABCD");
    await addOpenBankingProviderPage.submitProviderCreation();

    await addOpenBankingProviderPage.expectValidationError("ibanInvalid");

    await providersPage.goto();
    await providersPage.checkProviderNotVisible(providerName);
  });
});
