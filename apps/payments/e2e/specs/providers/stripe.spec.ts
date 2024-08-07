import { Page } from "@playwright/test";
import { test } from "../../fixtures/test";
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

test.describe("Stripe provider", () => {
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
    await addStripeProviderPage.enterName(providerName);
    await addStripeProviderPage.enterPublishableKey(mockStripePublishableKey);
    await addStripeProviderPage.enterSecretKey(mockStripeSecretKey);
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
    await addStripeProviderPage.enterName("");
    await addStripeProviderPage.enterPublishableKey(mockStripePublishableKey);
    await addStripeProviderPage.enterSecretKey(mockStripeSecretKey);
    await addStripeProviderPage.submitProviderCreation();

    await addStripeProviderPage.expectValidationError("nameRequired");
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
    await addStripeProviderPage.enterName(providerName);
    await addStripeProviderPage.enterPublishableKey("");
    await addStripeProviderPage.enterSecretKey(mockStripeSecretKey);
    await addStripeProviderPage.submitProviderCreation();

    await addStripeProviderPage.expectValidationError("publishableKeyRequired");

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
    await addStripeProviderPage.enterName(providerName);
    await addStripeProviderPage.enterPublishableKey(mockStripePublishableKey);
    await addStripeProviderPage.enterSecretKey("");
    await addStripeProviderPage.submitProviderCreation();

    await addStripeProviderPage.expectValidationError("secretKeyRequired");

    await providersPage.goto();
    await providersPage.checkProviderNotVisible(providerName);
  });
});
