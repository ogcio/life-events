import { Page } from "@playwright/test";
import { test } from "../../fixtures/test";
import { test as testWithProvider } from "../../fixtures/providersFixtures";
import {
  mockAccountHolderName,
  mockIban,
  otherMockIban,
} from "../../utils/mocks";
import { paymentSetupUrl } from "../../utils/constants";
import { ProvidersPage } from "../../objects/providers/ProvidersPage";
import {
  Severity,
  owner,
  tags,
  severity,
  description,
} from "allure-js-commons";
import { AddOpenBankingProviderPage } from "../../objects/providers/AddOpenBankingProviderPage";
import { EditOpenBankingProviderPage } from "../../objects/providers/EditOpenBankingProviderPage";

test.describe("Open Banking provider creation", () => {
  let page: Page;
  let providerName: string;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.beforeEach(async () => {
    providerName = `Test open banking ${Date.now()}`;
  });

  test("should add an open banking provider @smoke @critical", async () => {
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
    await addOpenBankingProviderPage.providerForm.enterName(providerName);
    await addOpenBankingProviderPage.providerForm.enterAccountHolderName(
      mockAccountHolderName,
    );
    await addOpenBankingProviderPage.providerForm.enterIban(mockIban);
    await addOpenBankingProviderPage.submitProviderCreation();

    await providersPage.checkProviderVisible(providerName);
  });

  test("should show error creating open banking provider if name is missing @regression @normal", async () => {
    await description(
      "This test checks that a validation error is shown when creating a new open banking provider if name is missing.",
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
    await addOpenBankingProviderPage.providerForm.enterName("");
    await addOpenBankingProviderPage.providerForm.enterAccountHolderName(
      mockAccountHolderName,
    );
    await addOpenBankingProviderPage.providerForm.enterIban(mockIban);
    await addOpenBankingProviderPage.submitProviderCreation();

    await addOpenBankingProviderPage.providerForm.expectValidationError(
      "nameRequired",
    );
  });

  test("should not add an open banking provider if iban is missing @regression @normal", async () => {
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
    await addOpenBankingProviderPage.providerForm.enterName(providerName);
    await addOpenBankingProviderPage.providerForm.enterAccountHolderName(
      mockAccountHolderName,
    );
    await addOpenBankingProviderPage.providerForm.enterIban("");
    await addOpenBankingProviderPage.submitProviderCreation();

    await addOpenBankingProviderPage.providerForm.expectValidationError(
      "ibanRequired",
    );

    await providersPage.goto();
    await providersPage.checkProviderNotVisible(providerName);
  });

  test("should not add an open banking provider if account holder name is missing @regression @normal", async () => {
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
    await addOpenBankingProviderPage.providerForm.enterName(providerName);
    await addOpenBankingProviderPage.providerForm.enterAccountHolderName("");
    await addOpenBankingProviderPage.providerForm.enterIban(mockIban);
    await addOpenBankingProviderPage.submitProviderCreation();

    await addOpenBankingProviderPage.providerForm.expectValidationError(
      "accountHolderNameRequired",
    );

    await providersPage.goto();
    await providersPage.checkProviderNotVisible(providerName);
  });

  test("should not add an open banking provider if iban is invalid @regression @normal", async () => {
    await description(
      "This test checks that a newn open banking provider is not created if an invalid iban is provided.",
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
    await addOpenBankingProviderPage.providerForm.enterName(providerName);
    await addOpenBankingProviderPage.providerForm.enterAccountHolderName(
      mockAccountHolderName,
    );
    await addOpenBankingProviderPage.providerForm.enterIban("ABCD");
    await addOpenBankingProviderPage.submitProviderCreation();

    await addOpenBankingProviderPage.providerForm.expectValidationError(
      "ibanInvalid",
    );

    await providersPage.goto();
    await providersPage.checkProviderNotVisible(providerName);
  });
});

testWithProvider.describe("Open banking provider editing", () => {
  let page: Page;
  const newAccountHolderName = "foo bar";

  testWithProvider.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  testWithProvider(
    "should edit an open banking provider @regression @normal",
    async ({ openBankingProvider }) => {
      await description(
        "This test checks the successful editing of an open banking provider.",
      );
      await owner("OGCIO");
      await tags("Providers", "Open Banking");
      await severity(Severity.NORMAL);

      const newProviderName = `${openBankingProvider} edited`;

      await page.goto(paymentSetupUrl);

      const providersMenuLink = await page.getByRole("link", {
        name: "Providers",
      });
      await providersMenuLink.click();

      const providersPage = new ProvidersPage(page);
      await providersPage.editProvider(openBankingProvider);
      const editProviderPage = new EditOpenBankingProviderPage(page);
      await editProviderPage.checkHeaderVisible();
      await editProviderPage.providerForm.checkName(openBankingProvider);
      await editProviderPage.providerForm.enterName(newProviderName);
      await editProviderPage.providerForm.checkAccountHolderName(
        mockAccountHolderName,
      );
      await editProviderPage.providerForm.enterAccountHolderName(
        newAccountHolderName,
      );
      await editProviderPage.providerForm.checkIban(mockIban);
      await editProviderPage.providerForm.enterIban(otherMockIban);
      await editProviderPage.saveChanges();

      await providersPage.checkProviderVisible(openBankingProvider);
      await providersPage.editProvider(newProviderName);
      await editProviderPage.providerForm.checkName(newProviderName);
      await editProviderPage.providerForm.checkAccountHolderName(
        newAccountHolderName,
      );
      await editProviderPage.providerForm.checkIban(otherMockIban);
    },
  );

  testWithProvider(
    "should disable and enable an open banking provider @regression @normal",
    async ({ openBankingProvider }) => {
      await description(
        "This test checks that an open banking provider is successfully disabled and enabled.",
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
      await providersPage.editProvider(openBankingProvider);
      const editProviderPage = new EditOpenBankingProviderPage(page);
      await editProviderPage.checkHeaderVisible();
      await editProviderPage.disableProvider();
      await providersPage.checkProviderIsDisabled(openBankingProvider);

      await providersPage.editProvider(openBankingProvider);
      await editProviderPage.checkHeaderVisible();
      await editProviderPage.enableProvider();
      await providersPage.checkProviderIsEnabled(openBankingProvider);
    },
  );

  testWithProvider(
    "should not edit an open banking provider if name is missing @regression @normal",
    async ({ openBankingProvider }) => {
      await description(
        "This test checks that while editing an open banking provider it cannot be saved if name is missing.",
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
      await providersPage.editProvider(openBankingProvider);
      const editProviderPage = new EditOpenBankingProviderPage(page);
      await editProviderPage.checkHeaderVisible();
      await editProviderPage.providerForm.checkName(openBankingProvider);
      await editProviderPage.providerForm.enterName("");
      await editProviderPage.saveChanges();
      await editProviderPage.providerForm.expectValidationError("nameRequired");
    },
  );

  testWithProvider(
    "should not edit an open banking provider if account holder name is missing @regression @normal",
    async ({ openBankingProvider }) => {
      await description(
        "This test checks that while editing an open banking provider it cannot be saved if account holder name is missing.",
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
      await providersPage.editProvider(openBankingProvider);
      const editProviderPage = new EditOpenBankingProviderPage(page);
      await editProviderPage.checkHeaderVisible();
      await editProviderPage.providerForm.checkAccountHolderName(
        mockAccountHolderName,
      );
      await editProviderPage.providerForm.enterAccountHolderName("");
      await editProviderPage.saveChanges();
      await editProviderPage.providerForm.expectValidationError(
        "accountHolderNameRequired",
      );

      await providersPage.goto();
      await providersPage.editProvider(openBankingProvider);
      await editProviderPage.providerForm.checkAccountHolderName(
        mockAccountHolderName,
      );
    },
  );

  testWithProvider(
    "should not edit an open banking provider if iban is missing @regression @normal",
    async ({ openBankingProvider }) => {
      await description(
        "This test checks that while editing an open banking provider it cannot be saved if iban is missing.",
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
      await providersPage.editProvider(openBankingProvider);
      const editProviderPage = new EditOpenBankingProviderPage(page);
      await editProviderPage.checkHeaderVisible();
      await editProviderPage.providerForm.checkIban(mockIban);
      await editProviderPage.providerForm.enterIban("");
      await editProviderPage.saveChanges();
      await editProviderPage.providerForm.expectValidationError("ibanRequired");

      await providersPage.goto();
      await providersPage.editProvider(openBankingProvider);
      await editProviderPage.providerForm.checkIban(mockIban);
    },
  );

  testWithProvider(
    "should not edit an open banking provider if iban is invalid @regression @normal",
    async ({ openBankingProvider }) => {
      await description(
        "This test checks that while editing an open banking provider it cannot be saved if iban is invalid.",
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
      await providersPage.editProvider(openBankingProvider);
      const editProviderPage = new EditOpenBankingProviderPage(page);
      await editProviderPage.checkHeaderVisible();
      await editProviderPage.providerForm.checkIban(mockIban);
      await editProviderPage.providerForm.enterIban("foo");
      await editProviderPage.saveChanges();
      await editProviderPage.providerForm.expectValidationError("ibanInvalid");

      await providersPage.goto();
      await providersPage.editProvider(openBankingProvider);
      await editProviderPage.providerForm.checkIban(mockIban);
    },
  );
});
