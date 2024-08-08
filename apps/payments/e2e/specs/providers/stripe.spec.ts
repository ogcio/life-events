import { Page } from "@playwright/test";
import { test } from "../../fixtures/test";
import { test as testWithProvider } from "../../fixtures/providersFixtures";
import {
  mockStripePublishableKey,
  mockStripeSecretKey,
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
import { AddStripeProviderPage } from "../../objects/providers/AddStripeProviderPage";
import { EditStripeProviderPage } from "../../objects/providers/EditStripeProviderPage";

test.describe("Stripe provider creation", () => {
  let page: Page;
  let providerName: string;

  test.beforeAll(async ({ browser }) => (page = await browser.newPage()));

  test.beforeEach(async () => {
    providerName = `Test stripe ${Date.now()}`;
  });

  test("should add a stripe provider @smoke @critical", async () => {
    await description(
      "This test checks the successful creation of a new stripe provider.",
    );
    await owner("OGCIO");
    await tags("Providers", "Stripe");
    await severity(Severity.CRITICAL);
    await page.goto(paymentSetupUrl);

    const providersMenuLink = await page.getByRole("link", {
      name: "Providers",
    });
    await providersMenuLink.click();

    const providersPage = new ProvidersPage(page);
    await providersPage.createNewPaymentProvider();
    await providersPage.selectStripeProvider();

    const addStripeProviderPage = new AddStripeProviderPage(page);
    await addStripeProviderPage.providerForm.enterName(providerName);
    await addStripeProviderPage.providerForm.enterPublishableKey(
      mockStripePublishableKey,
    );
    await addStripeProviderPage.providerForm.enterSecretKey(
      mockStripeSecretKey,
    );
    await addStripeProviderPage.submitProviderCreation();

    await providersPage.checkProviderVisible(providerName);
  });

  test("should show error creating stripe provider if name is missing @regression @normal", async () => {
    await description(
      "This test checks that a validation error is shown when creating a new stripe provider if name is missing.",
    );
    await owner("OGCIO");
    await tags("Providers", "Stripe");
    await severity(Severity.NORMAL);

    await page.goto(paymentSetupUrl);

    const providersMenuLink = await page.getByRole("link", {
      name: "Providers",
    });
    await providersMenuLink.click();

    const providersPage = new ProvidersPage(page);
    await providersPage.createNewPaymentProvider();
    await providersPage.selectStripeProvider();

    const addStripeProviderPage = new AddStripeProviderPage(page);
    await addStripeProviderPage.providerForm.enterName("");
    await addStripeProviderPage.providerForm.enterPublishableKey(
      mockStripePublishableKey,
    );
    await addStripeProviderPage.providerForm.enterSecretKey(
      mockStripeSecretKey,
    );
    await addStripeProviderPage.submitProviderCreation();

    await addStripeProviderPage.providerForm.expectValidationError(
      "nameRequired",
    );
  });

  test("should not add a stripe provider if publishable key is missing @regression @normal", async () => {
    await description(
      "This test checks that a new stripe provider is not created if publishable key is missing.",
    );
    await owner("OGCIO");
    await tags("Providers", "Stripe");
    await severity(Severity.NORMAL);

    await page.goto(paymentSetupUrl);

    const providersMenuLink = await page.getByRole("link", {
      name: "Providers",
    });
    await providersMenuLink.click();

    const providersPage = new ProvidersPage(page);
    await providersPage.createNewPaymentProvider();
    await providersPage.selectStripeProvider();

    const addStripeProviderPage = new AddStripeProviderPage(page);
    await addStripeProviderPage.providerForm.enterName(providerName);
    await addStripeProviderPage.providerForm.enterPublishableKey("");
    await addStripeProviderPage.providerForm.enterSecretKey(
      mockStripeSecretKey,
    );
    await addStripeProviderPage.submitProviderCreation();

    await addStripeProviderPage.providerForm.expectValidationError(
      "publishableKeyRequired",
    );

    await providersPage.goto();
    await providersPage.checkProviderNotVisible(providerName);
  });

  test("should not add a stripe provider if secret key is missing @regression @normal", async () => {
    await description(
      "This test checks that a new stripe provider is not created if secret key is missing.",
    );
    await owner("OGCIO");
    await tags("Providers", "Stripe");
    await severity(Severity.NORMAL);

    await page.goto(paymentSetupUrl);

    const providersMenuLink = await page.getByRole("link", {
      name: "Providers",
    });
    await providersMenuLink.click();

    const providersPage = new ProvidersPage(page);
    await providersPage.createNewPaymentProvider();
    await providersPage.selectStripeProvider();

    const addStripeProviderPage = new AddStripeProviderPage(page);
    await addStripeProviderPage.providerForm.enterName(providerName);
    await addStripeProviderPage.providerForm.enterPublishableKey(
      mockStripePublishableKey,
    );
    await addStripeProviderPage.providerForm.enterSecretKey("");
    await addStripeProviderPage.submitProviderCreation();

    await addStripeProviderPage.providerForm.expectValidationError(
      "secretKeyRequired",
    );

    await providersPage.goto();
    await providersPage.checkProviderNotVisible(providerName);
  });
});

testWithProvider.describe("Stripe provider editing", () => {
  let page: Page;

  testWithProvider.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  testWithProvider(
    "should edit a Stripe provider @regression @normal",
    async ({ stripeProvider }) => {
      await description(
        "This test checks the successful editing of a Stripe provider.",
      );
      await owner("OGCIO");
      await tags("Providers", "Stripe");
      await severity(Severity.NORMAL);

      const newSecretKey = "new_sk_test_123456";
      const newPublishableKey = "new_pk_test_123456";
      const newProviderName = `${stripeProvider} edited`;

      await page.goto(paymentSetupUrl);

      const providersMenuLink = await page.getByRole("link", {
        name: "Providers",
      });
      await providersMenuLink.click();

      const providersPage = new ProvidersPage(page);
      await providersPage.editProvider(stripeProvider);
      const editProviderPage = new EditStripeProviderPage(page);
      await editProviderPage.checkHeaderVisible();
      await editProviderPage.providerForm.checkName(stripeProvider);
      await editProviderPage.providerForm.enterName(newProviderName);
      await editProviderPage.providerForm.checkPublishableKey(
        mockStripePublishableKey,
      );
      await editProviderPage.providerForm.enterPublishableKey(
        newPublishableKey,
      );
      await editProviderPage.providerForm.checkSecretKey(mockStripeSecretKey);
      await editProviderPage.providerForm.enterSecretKey(newSecretKey);
      await editProviderPage.saveChanges();

      await providersPage.checkProviderVisible(newProviderName);
      await providersPage.editProvider(newProviderName);
      await editProviderPage.providerForm.checkName(newProviderName);
      await editProviderPage.providerForm.checkPublishableKey(
        newPublishableKey,
      );
      await editProviderPage.providerForm.checkSecretKey(newSecretKey);
    },
  );

  testWithProvider(
    "should disable and enable a stripe provider @regression @normal",
    async ({ stripeProvider }) => {
      await description(
        "This test checks that a stripe provider is successfully disabled and enabled.",
      );
      await owner("OGCIO");
      await tags("Providers", "Stripe");
      await severity(Severity.NORMAL);

      await page.goto(paymentSetupUrl);

      const providersMenuLink = await page.getByRole("link", {
        name: "Providers",
      });
      await providersMenuLink.click();

      const providersPage = new ProvidersPage(page);
      await providersPage.editProvider(stripeProvider);
      const editProviderPage = new EditStripeProviderPage(page);
      await editProviderPage.checkHeaderVisible();
      await editProviderPage.disableProvider();
      await providersPage.checkProviderIsDisabled(stripeProvider);

      await providersPage.editProvider(stripeProvider);
      await editProviderPage.checkHeaderVisible();
      await editProviderPage.enableProvider();
      await providersPage.checkProviderIsEnabled(stripeProvider);
    },
  );

  testWithProvider(
    "should not edit a Stripe provider if name is missing @regression @normal",
    async ({ stripeProvider }) => {
      await description(
        "This test checks that while editing a Stripe provider it cannot be saved if name is missing.",
      );
      await owner("OGCIO");
      await tags("Providers", "Stripe");
      await severity(Severity.NORMAL);

      await page.goto(paymentSetupUrl);

      const providersMenuLink = await page.getByRole("link", {
        name: "Providers",
      });
      await providersMenuLink.click();

      const providersPage = new ProvidersPage(page);
      await providersPage.editProvider(stripeProvider);
      const editProviderPage = new EditStripeProviderPage(page);
      await editProviderPage.checkHeaderVisible();
      await editProviderPage.providerForm.checkName(stripeProvider);
      await editProviderPage.providerForm.enterName("");
      await editProviderPage.saveChanges();
      await editProviderPage.providerForm.expectValidationError("nameRequired");
    },
  );

  testWithProvider(
    "should not edit a stripe provider if publishable key is missing @regression @normal",
    async ({ stripeProvider }) => {
      await description(
        "This test checks that while editing a stripe provider it cannot be saved if publishable key is missing.",
      );
      await owner("OGCIO");
      await tags("Providers", "Stripe");
      await severity(Severity.NORMAL);

      await page.goto(paymentSetupUrl);

      const providersMenuLink = await page.getByRole("link", {
        name: "Providers",
      });
      await providersMenuLink.click();

      const providersPage = new ProvidersPage(page);
      await providersPage.editProvider(stripeProvider);
      const editProviderPage = new EditStripeProviderPage(page);
      await editProviderPage.checkHeaderVisible();
      await editProviderPage.providerForm.checkPublishableKey(
        mockStripePublishableKey,
      );
      await editProviderPage.providerForm.enterPublishableKey("");
      await editProviderPage.saveChanges();
      await editProviderPage.providerForm.expectValidationError(
        "publishableKeyRequired",
      );

      await providersPage.goto();
      await providersPage.editProvider(stripeProvider);
      await editProviderPage.providerForm.checkPublishableKey(
        mockStripePublishableKey,
      );
    },
  );

  testWithProvider(
    "should not edit a stripe provider if secret key is missing @regression @normal",
    async ({ stripeProvider }) => {
      await description(
        "This test checks that while editing a stripe provider it cannot be saved if secret key is missing.",
      );
      await owner("OGCIO");
      await tags("Providers", "Stripe");
      await severity(Severity.NORMAL);

      await page.goto(paymentSetupUrl);

      const providersMenuLink = await page.getByRole("link", {
        name: "Providers",
      });
      await providersMenuLink.click();

      const providersPage = new ProvidersPage(page);
      await providersPage.editProvider(stripeProvider);
      const editProviderPage = new EditStripeProviderPage(page);
      await editProviderPage.checkHeaderVisible();
      await editProviderPage.providerForm.checkSecretKey(mockStripeSecretKey);
      await editProviderPage.providerForm.enterSecretKey("");
      await editProviderPage.saveChanges();
      await editProviderPage.providerForm.expectValidationError(
        "secretKeyRequired",
      );

      await providersPage.goto();
      await providersPage.editProvider(stripeProvider);
      await editProviderPage.providerForm.checkSecretKey(mockStripeSecretKey);
    },
  );
});
