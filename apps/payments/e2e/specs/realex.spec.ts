import { Page } from "@playwright/test";
import { test } from "../fixtures/test";
import { mockRealexMerchantId, mockRealexSharedSecret } from "../utils/mocks";
import { paymentSetupUrl } from "../utils/constants";
import { ProvidersPage } from "../objects/providers/ProvidersPage";
import {
  Severity,
  owner,
  tags,
  severity,
  description,
} from "allure-js-commons";
import { AddRealexProviderPage } from "../objects/providers/AddRealexProviderPage";

test.describe("Realex provider", () => {
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
    await addRealexProviderPage.enterName(providerName);
    await addRealexProviderPage.enterMerchantId(mockRealexMerchantId);
    await addRealexProviderPage.enterSharedSecret(mockRealexSharedSecret);
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
    await addRealexProviderPage.enterName("");
    await addRealexProviderPage.enterMerchantId(mockRealexMerchantId);
    await addRealexProviderPage.enterSharedSecret(mockRealexSharedSecret);
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
    await addRealexProviderPage.enterName(providerName);
    await addRealexProviderPage.enterMerchantId("");
    await addRealexProviderPage.enterSharedSecret(mockRealexSharedSecret);
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
    await addRealexProviderPage.enterName(providerName);
    await addRealexProviderPage.enterMerchantId(mockRealexMerchantId);
    await addRealexProviderPage.enterSharedSecret("");
    await addRealexProviderPage.submitProviderCreation();

    await addRealexProviderPage.expectValidationError("sharedSecretRequired");

    await providersPage.goto();
    await providersPage.checkProviderNotVisible(providerName);
  });
});
