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
import { AddManualBankTransferProviderPage } from "../../objects/providers/AddManualBankTransferProviderPage";
import {
  Severity,
  owner,
  tags,
  severity,
  description,
} from "allure-js-commons";
import { EditManualBankTransferProviderPage } from "../../objects/providers/EditManualBankTransferProviderPage";

test.describe("Manual bank transfer provider creation", () => {
  let page: Page;
  let providerName: string;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.beforeEach(async () => {
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
    await addManualBankTransferProviderPage.providerForm.enterName(
      providerName,
    );
    await addManualBankTransferProviderPage.providerForm.enterAccountHolderName(
      mockAccountHolderName,
    );
    await addManualBankTransferProviderPage.providerForm.enterIban(mockIban);
    await addManualBankTransferProviderPage.submitProviderCreation();

    await providersPage.checkProviderVisible(providerName);
  });

  test("should show error creating manual bank transfer provider if name is missing @regression @normal", async () => {
    await description(
      "This test checks that a validation error is shown when creating a new manual bank transfer provider if name is missing.",
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
    await addManualBankTransferProviderPage.providerForm.enterName("");
    await addManualBankTransferProviderPage.providerForm.enterAccountHolderName(
      mockAccountHolderName,
    );
    await addManualBankTransferProviderPage.providerForm.enterIban(mockIban);
    await addManualBankTransferProviderPage.submitProviderCreation();

    await addManualBankTransferProviderPage.providerForm.expectValidationError(
      "nameRequired",
    );
  });

  test("should not add a manual bank transfer provider if iban is missing @regression @normal", async () => {
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
    await addManualBankTransferProviderPage.providerForm.enterName(
      providerName,
    );
    await addManualBankTransferProviderPage.providerForm.enterAccountHolderName(
      mockAccountHolderName,
    );
    await addManualBankTransferProviderPage.providerForm.enterIban("");
    await addManualBankTransferProviderPage.submitProviderCreation();

    await addManualBankTransferProviderPage.providerForm.expectValidationError(
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
    await addManualBankTransferProviderPage.providerForm.enterName(
      providerName,
    );
    await addManualBankTransferProviderPage.providerForm.enterAccountHolderName(
      "",
    );
    await addManualBankTransferProviderPage.providerForm.enterIban("ABCD");
    await addManualBankTransferProviderPage.submitProviderCreation();

    await addManualBankTransferProviderPage.providerForm.expectValidationError(
      "accountHolderNameRequired",
    );

    await providersPage.goto();
    await providersPage.checkProviderNotVisible(providerName);
  });

  test("should not add a manual bank transfer provider if iban is invalid @regression @normal", async () => {
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
    await addManualBankTransferProviderPage.providerForm.enterName(
      providerName,
    );
    await addManualBankTransferProviderPage.providerForm.enterAccountHolderName(
      mockAccountHolderName,
    );
    await addManualBankTransferProviderPage.providerForm.enterIban("ABCD");
    await addManualBankTransferProviderPage.submitProviderCreation();

    await addManualBankTransferProviderPage.providerForm.expectValidationError(
      "ibanInvalid",
    );

    await providersPage.goto();
    await providersPage.checkProviderNotVisible(providerName);
  });
});

testWithProvider.describe("Manual bank transfer provider editing", () => {
  let page: Page;
  const newAccountHolderName = "foo bar";

  testWithProvider.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  testWithProvider(
    "should edit a manual bank transfer provider @regression @normal",
    async ({ bankTransferProvider }) => {
      await description(
        "This test checks the successful editing of a manual bank transfer provider.",
      );
      await owner("OGCIO");
      await tags("Providers", "Manual Bank Transfer");
      await severity(Severity.NORMAL);

      const providerName = bankTransferProvider;
      const newProviderName = `${providerName} edited`;

      await page.goto(paymentSetupUrl);

      const providersMenuLink = await page.getByRole("link", {
        name: "Providers",
      });
      await providersMenuLink.click();

      const providersPage = new ProvidersPage(page);
      await providersPage.editProvider(providerName);
      const editProviderPage = new EditManualBankTransferProviderPage(page);
      await editProviderPage.checkHeaderVisible();
      await editProviderPage.providerForm.checkName(providerName);
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

      await providersPage.checkProviderVisible(providerName);
      await providersPage.editProvider(newProviderName);
      await editProviderPage.providerForm.checkName(newProviderName);
      await editProviderPage.providerForm.checkAccountHolderName(
        newAccountHolderName,
      );
      await editProviderPage.providerForm.checkIban(otherMockIban);
    },
  );

  testWithProvider(
    "should disable and enable a manual bank transfer provider @regression @normal",
    async ({ bankTransferProvider }) => {
      await description(
        "This test checks that a manual bank transfer provider is successfully disabled and enabled.",
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
      await providersPage.editProvider(bankTransferProvider);
      const editProviderPage = new EditManualBankTransferProviderPage(page);
      await editProviderPage.checkHeaderVisible();
      await editProviderPage.disableProvider();
      await providersPage.checkProviderIsDisabled(bankTransferProvider);

      await providersPage.editProvider(bankTransferProvider);
      await editProviderPage.checkHeaderVisible();
      await editProviderPage.enableProvider();
      await providersPage.checkProviderIsEnabled(bankTransferProvider);
    },
  );

  testWithProvider(
    "should not edit a manual bank transfer provider if name is missing @regression @normal",
    async ({ bankTransferProvider }) => {
      await description(
        "This test checks that while editing a manual bank transfer provider it cannot be saved if name is missing.",
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
      await providersPage.editProvider(bankTransferProvider);
      const editProviderPage = new EditManualBankTransferProviderPage(page);
      await editProviderPage.checkHeaderVisible();
      await editProviderPage.providerForm.checkName(bankTransferProvider);
      await editProviderPage.providerForm.enterName("");
      await editProviderPage.saveChanges();
      await editProviderPage.providerForm.expectValidationError("nameRequired");
    },
  );

  testWithProvider(
    "should not edit a manual bank transfer provider if account holder name is missing @regression @normal",
    async ({ bankTransferProvider }) => {
      await description(
        "This test checks that while editing a manual bank transfer provider it cannot be saved if account holder name is missing.",
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
      await providersPage.editProvider(bankTransferProvider);
      const editProviderPage = new EditManualBankTransferProviderPage(page);
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
      await providersPage.editProvider(bankTransferProvider);
      await editProviderPage.providerForm.checkAccountHolderName(
        mockAccountHolderName,
      );
    },
  );
});
