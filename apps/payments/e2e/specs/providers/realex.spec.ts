import { Page } from "@playwright/test";
import { test } from "../../fixtures/test";
import { test as testWithProvider } from "../../fixtures/providersFixtures";
import {
  mockRealexMerchantId,
  mockRealexSharedSecret,
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
import { AddRealexProviderPage } from "../../objects/providers/AddRealexProviderPage";
import { EditRealexProviderPage } from "../../objects/providers/EditRealexProviderPage";

test.describe("Realex provider creation", () => {
  let page: Page;
  let providerName: string;

  test.beforeAll(async ({ browser }) => (page = await browser.newPage()));

  test.beforeEach(async () => {
    providerName = `Test realex ${Date.now()}`;
  });

  test("should add a realex provider @smoke @critical", async () => {
    await description(
      "This test checks the successful creation of a new realex provider.",
    );
    await owner("OGCIO");
    await tags("Providers", "Realex");
    await severity(Severity.CRITICAL);
    await page.goto(paymentSetupUrl);

    const providersMenuLink = await page.getByRole("link", {
      name: "Providers",
    });
    await providersMenuLink.click();

    const providersPage = new ProvidersPage(page);
    await providersPage.createNewPaymentProvider();
    await providersPage.selectRealexProvider();

    const addRealexProviderPage = new AddRealexProviderPage(page);
    await addRealexProviderPage.providerForm.enterName(providerName);
    await addRealexProviderPage.providerForm.enterMerchantId(
      mockRealexMerchantId,
    );
    await addRealexProviderPage.providerForm.enterSharedSecret(
      mockRealexSharedSecret,
    );
    await addRealexProviderPage.submitProviderCreation();

    await providersPage.checkProviderVisible(providerName);
  });

  test("should show error creating realex provider if name is missing @regression @normal", async () => {
    await description(
      "This test checks that a validation error is shown when creating a new realex provider if name is missing.",
    );
    await owner("OGCIO");
    await tags("Providers", "Realex");
    await severity(Severity.NORMAL);

    await page.goto(paymentSetupUrl);

    const providersMenuLink = await page.getByRole("link", {
      name: "Providers",
    });
    await providersMenuLink.click();

    const providersPage = new ProvidersPage(page);
    await providersPage.createNewPaymentProvider();
    await providersPage.selectRealexProvider();

    const addRealexProviderPage = new AddRealexProviderPage(page);
    await addRealexProviderPage.providerForm.enterName("");
    await addRealexProviderPage.providerForm.enterMerchantId(
      mockRealexMerchantId,
    );
    await addRealexProviderPage.providerForm.enterSharedSecret(
      mockRealexSharedSecret,
    );
    await addRealexProviderPage.submitProviderCreation();

    await addRealexProviderPage.expectValidationError("nameRequired");
  });

  test("should not add a realex provider if merchant id is missing @regression @normal", async () => {
    await description(
      "This test checks that a new realex provider is not created if merchant id is missing.",
    );
    await owner("OGCIO");
    await tags("Providers", "Realex");
    await severity(Severity.NORMAL);

    await page.goto(paymentSetupUrl);

    const providersMenuLink = await page.getByRole("link", {
      name: "Providers",
    });
    await providersMenuLink.click();

    const providersPage = new ProvidersPage(page);
    await providersPage.createNewPaymentProvider();
    await providersPage.selectRealexProvider();

    const addRealexProviderPage = new AddRealexProviderPage(page);
    await addRealexProviderPage.providerForm.enterName(providerName);
    await addRealexProviderPage.providerForm.enterMerchantId("");
    await addRealexProviderPage.providerForm.enterSharedSecret(
      mockRealexSharedSecret,
    );
    await addRealexProviderPage.submitProviderCreation();

    await addRealexProviderPage.expectValidationError("merchantIdRequired");

    await providersPage.goto();
    await providersPage.checkProviderNotVisible(providerName);
  });

  test("should not add a realex provider if shared secret is missing @regression @normal", async () => {
    await description(
      "This test checks that a new realex provider is not created if shared secret is missing.",
    );
    await owner("OGCIO");
    await tags("Providers", "Realex");
    await severity(Severity.NORMAL);

    await page.goto(paymentSetupUrl);

    const providersMenuLink = await page.getByRole("link", {
      name: "Providers",
    });
    await providersMenuLink.click();

    const providersPage = new ProvidersPage(page);
    await providersPage.createNewPaymentProvider();
    await providersPage.selectRealexProvider();

    const addRealexProviderPage = new AddRealexProviderPage(page);
    await addRealexProviderPage.providerForm.enterName(providerName);
    await addRealexProviderPage.providerForm.enterMerchantId(
      mockRealexMerchantId,
    );
    await addRealexProviderPage.providerForm.enterSharedSecret("");
    await addRealexProviderPage.submitProviderCreation();

    await addRealexProviderPage.expectValidationError("sharedSecretRequired");

    await providersPage.goto();
    await providersPage.checkProviderNotVisible(providerName);
  });
});

testWithProvider.describe("Realex provider editing", () => {
  let page: Page;

  testWithProvider.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  testWithProvider(
    "should edit a realex provider @regression @normal",
    async ({ realexProvider }) => {
      await description(
        "This test checks the successful editing of a realex provider.",
      );
      await owner("OGCIO");
      await tags("Providers", "Realex");
      await severity(Severity.NORMAL);

      const newProviderName = `${realexProvider} edited`;
      const newMerchantId = "new_mock_realex_id";
      const newSharedSecret = "new_mock_realex_secret";

      await page.goto(paymentSetupUrl);

      const providersMenuLink = await page.getByRole("link", {
        name: "Providers",
      });
      await providersMenuLink.click();

      const providersPage = new ProvidersPage(page);
      await providersPage.editProvider(realexProvider);
      const editProviderPage = new EditRealexProviderPage(page);
      await editProviderPage.checkHeaderVisible();
      await editProviderPage.providerForm.checkName(realexProvider);
      await editProviderPage.providerForm.enterName(newProviderName);
      await editProviderPage.providerForm.checkMerchantId(mockRealexMerchantId);
      await editProviderPage.providerForm.enterMerchantId(newMerchantId);
      await editProviderPage.providerForm.checkSharedSecret(
        mockRealexSharedSecret,
      );
      await editProviderPage.providerForm.enterSharedSecret(newSharedSecret);
      await editProviderPage.saveChanges();

      await providersPage.checkProviderVisible(newProviderName);
      await providersPage.editProvider(newProviderName);
      await editProviderPage.providerForm.checkName(newProviderName);
      await editProviderPage.providerForm.checkMerchantId(newMerchantId);
      await editProviderPage.providerForm.checkSharedSecret(newSharedSecret);
    },
  );

  testWithProvider(
    "should disable and enable a realex provider @regression @normal",
    async ({ realexProvider }) => {
      await description(
        "This test checks that a realex provider is successfully disabled and enabled.",
      );
      await owner("OGCIO");
      await tags("Providers", "Realex");
      await severity(Severity.NORMAL);

      await page.goto(paymentSetupUrl);

      const providersMenuLink = await page.getByRole("link", {
        name: "Providers",
      });
      await providersMenuLink.click();

      const providersPage = new ProvidersPage(page);
      await providersPage.editProvider(realexProvider);
      const editProviderPage = new EditRealexProviderPage(page);
      await editProviderPage.checkHeaderVisible();
      await editProviderPage.disableProvider();
      await providersPage.checkProviderIsDisabled(realexProvider);

      await providersPage.editProvider(realexProvider);
      await editProviderPage.checkHeaderVisible();
      await editProviderPage.enableProvider();
      await providersPage.checkProviderIsEnabled(realexProvider);
    },
  );

  testWithProvider(
    "should not edit a realex provider if name is missing @regression @normal",
    async ({ realexProvider }) => {
      await description(
        "This test checks that while editing a realex provider it cannot be saved if name is missing.",
      );
      await owner("OGCIO");
      await tags("Providers", "Realex");
      await severity(Severity.NORMAL);

      await page.goto(paymentSetupUrl);

      const providersMenuLink = await page.getByRole("link", {
        name: "Providers",
      });
      await providersMenuLink.click();

      const providersPage = new ProvidersPage(page);
      await providersPage.editProvider(realexProvider);
      const editProviderPage = new EditRealexProviderPage(page);
      await editProviderPage.checkHeaderVisible();
      await editProviderPage.providerForm.checkName(realexProvider);
      await editProviderPage.providerForm.enterName("");
      await editProviderPage.saveChanges();
      await editProviderPage.providerForm.expectValidationError("nameRequired");
    },
  );

  testWithProvider(
    "should not edit a realex provider if merchant id is missing @regression @normal",
    async ({ realexProvider }) => {
      await description(
        "This test checks that while editing a realex provider it cannot be saved if merchant id is missing.",
      );
      await owner("OGCIO");
      await tags("Providers", "Realex");
      await severity(Severity.NORMAL);

      await page.goto(paymentSetupUrl);

      const providersMenuLink = await page.getByRole("link", {
        name: "Providers",
      });
      await providersMenuLink.click();

      const providersPage = new ProvidersPage(page);
      await providersPage.editProvider(realexProvider);
      const editProviderPage = new EditRealexProviderPage(page);
      await editProviderPage.checkHeaderVisible();
      await editProviderPage.providerForm.checkMerchantId(mockRealexMerchantId);
      await editProviderPage.providerForm.enterMerchantId("");
      await editProviderPage.saveChanges();
      await editProviderPage.providerForm.expectValidationError(
        "merchantIdRequired",
      );

      await providersPage.goto();
      await providersPage.editProvider(realexProvider);
      await editProviderPage.providerForm.checkMerchantId(mockRealexMerchantId);
    },
  );

  testWithProvider(
    "should not edit a realex provider if shared secret is missing @regression @normal",
    async ({ realexProvider }) => {
      await description(
        "This test checks that while editing a realex provider it cannot be saved if shared secret is missing.",
      );
      await owner("OGCIO");
      await tags("Providers", "Realex");
      await severity(Severity.NORMAL);

      await page.goto(paymentSetupUrl);

      const providersMenuLink = await page.getByRole("link", {
        name: "Providers",
      });
      await providersMenuLink.click();

      const providersPage = new ProvidersPage(page);
      await providersPage.editProvider(realexProvider);
      const editProviderPage = new EditRealexProviderPage(page);
      await editProviderPage.checkHeaderVisible();
      await editProviderPage.providerForm.checkSharedSecret(
        mockRealexSharedSecret,
      );
      await editProviderPage.providerForm.enterSharedSecret("");
      await editProviderPage.saveChanges();
      await editProviderPage.providerForm.expectValidationError(
        "sharedSecretRequired",
      );

      await providersPage.goto();
      await providersPage.editProvider(realexProvider);
      await editProviderPage.providerForm.checkSharedSecret(
        mockRealexSharedSecret,
      );
    },
  );
});
