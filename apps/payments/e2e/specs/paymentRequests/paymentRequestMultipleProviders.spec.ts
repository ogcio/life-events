import { Page } from "@playwright/test";
import { test } from "../../fixtures/providersFixtures";
import {
  Severity,
  owner,
  tags,
  severity,
  description,
} from "allure-js-commons";
import { PaymentRequestsPage } from "../../objects/paymentRequests/PaymentRequestsListPage";
import { PaymentRequestFormPage } from "../../objects/paymentRequests/PaymentRequestFormPage";
import {
  mockAmount,
  mockPaymentRequestReference,
  mockRedirectUrl,
  paymentRequestDescription,
} from "../../utils/mocks";
import { PaymentRequestDetailsPage } from "../../objects/paymentRequests/PaymentRequestDetailsPage";
import { InactivePayPage } from "../../objects/payments/InactivePayPage";
import { PreviewPayPage } from "../../objects/payments/PreviewPayPage";

test.describe("Payment Request with multiple providers", () => {
  let page: Page;
  let name: string;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.beforeEach(async () => {
    name = `Test multiple ${Date.now()}`;
  });

  test("should create an inactive payment request with multiple providers provider @smoke @normal", async ({
    context,
    bankTransferProvider,
    openBankingProvider,
    realexProvider,
  }) => {
    await description(
      "This test checks the successful creation of an inactive payment request with multiple providers.",
    );
    await owner("OGCIO");
    await tags("Payment Request", "Multiple");
    await severity(Severity.NORMAL);

    const paymentRequestsPage = new PaymentRequestsPage(page);
    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoCreate();

    const createPaymentRequestPage = new PaymentRequestFormPage(page);
    await createPaymentRequestPage.enterTitle(name);
    await createPaymentRequestPage.enterDescription(paymentRequestDescription);
    await createPaymentRequestPage.selectManualBankTransferAccount(
      bankTransferProvider,
    );
    await createPaymentRequestPage.selectOpenBankingAccount(
      openBankingProvider,
    );
    await createPaymentRequestPage.selectCardAccount(realexProvider);
    await createPaymentRequestPage.enterReference(mockPaymentRequestReference);
    await createPaymentRequestPage.enterAmount(mockAmount);
    await createPaymentRequestPage.selectAllowAmountOverride();
    await createPaymentRequestPage.selectCustomAmount();
    await createPaymentRequestPage.enterRedirectURL(mockRedirectUrl);
    await createPaymentRequestPage.selectInactiveStatus();
    await createPaymentRequestPage.saveChanges();

    const detailsPage = new PaymentRequestDetailsPage(page);
    await detailsPage.checkHeader();
    await detailsPage.checkTitle(name);
    await detailsPage.checkDescription(paymentRequestDescription);
    await detailsPage.checkStatus("inactive");
    await detailsPage.checkAccounts([
      { name: bankTransferProvider, type: "banktransfer" },
      { name: openBankingProvider, type: "openbanking" },
      { name: realexProvider, type: "realex" },
    ]);
    await detailsPage.checkAmount(mockAmount);
    await detailsPage.checkRedirectUrl(mockRedirectUrl);
    await detailsPage.checkAmountOverrideOption(true);
    await detailsPage.checkCustomAmountOption(true);
    await detailsPage.checkEmptyPaymentsList();

    const link = await detailsPage.getPaymentLink();
    const newPage = await context.newPage();
    await newPage.goto(link);
    const inactivePayPage = new InactivePayPage(newPage);
    await inactivePayPage.checkHeader();
    await inactivePayPage.checkDescription();

    await paymentRequestsPage.goto();
    await paymentRequestsPage.checkHeader();
    await paymentRequestsPage.checkRequestIsVisible(name);
    await paymentRequestsPage.checkBeneficiaryAccounts(name, [
      bankTransferProvider,
      openBankingProvider,
      realexProvider,
    ]);
    await paymentRequestsPage.checkAmount(name, mockAmount);
    await paymentRequestsPage.checkStatus(name, "inactive");
    await paymentRequestsPage.checkReference(name, mockPaymentRequestReference);
  });

  test("should create an active payment request with multiple providers @smoke @normal", async ({
    bankTransferProvider,
    openBankingProvider,
    stripeProvider,
    context,
  }) => {
    await description(
      "This test checks the successful creation of an inactive payment request with multiple providers.",
    );
    await owner("OGCIO");
    await tags("Payment Request", "Multiple");
    await severity(Severity.NORMAL);

    const paymentRequestsPage = new PaymentRequestsPage(page);
    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoCreate();

    const createPaymentRequestPage = new PaymentRequestFormPage(page);
    await createPaymentRequestPage.enterTitle(name);
    await createPaymentRequestPage.enterDescription(paymentRequestDescription);
    await createPaymentRequestPage.selectManualBankTransferAccount(
      bankTransferProvider,
    );
    await createPaymentRequestPage.selectOpenBankingAccount(
      openBankingProvider,
    );
    await createPaymentRequestPage.selectCardAccount(stripeProvider);
    await createPaymentRequestPage.enterReference(mockPaymentRequestReference);
    await createPaymentRequestPage.enterAmount(mockAmount);
    await createPaymentRequestPage.enterRedirectURL(mockRedirectUrl);
    await createPaymentRequestPage.selectAllowAmountOverride();
    await createPaymentRequestPage.selectCustomAmount();
    await createPaymentRequestPage.selectActiveStatus();
    await createPaymentRequestPage.saveChanges();

    const detailsPage = new PaymentRequestDetailsPage(page);
    await detailsPage.checkHeader();
    await detailsPage.checkTitle(name);
    await detailsPage.checkDescription(paymentRequestDescription);
    await detailsPage.checkStatus("active");
    await detailsPage.checkAccounts([
      { name: bankTransferProvider, type: "banktransfer" },
      { name: openBankingProvider, type: "openbanking" },
      { name: stripeProvider, type: "stripe" },
    ]);
    await detailsPage.checkAmount(mockAmount);
    await detailsPage.checkRedirectUrl(mockRedirectUrl);
    await detailsPage.checkAmountOverrideOption(true);
    await detailsPage.checkCustomAmountOption(true);
    await detailsPage.checkEmptyPaymentsList();

    const link = await detailsPage.getPaymentLink();
    const newPage = await context.newPage();
    await newPage.goto(link);
    const previewPayPage = new PreviewPayPage(newPage);
    await previewPayPage.checkHeader();
    await previewPayPage.checkAmount(mockAmount);
    await previewPayPage.checkCustomAmountOptionVisible();
    await previewPayPage.checkPaymentMethodHeader();
    await previewPayPage.checkPaymentMethodVisible("banktransfer");
    await previewPayPage.checkPaymentMethodVisible("openbanking");
    await previewPayPage.checkPaymentMethodVisible("card");
    await previewPayPage.checkButton();

    await paymentRequestsPage.goto();
    await paymentRequestsPage.checkHeader();
    await paymentRequestsPage.checkRequestIsVisible(name);
    await paymentRequestsPage.checkBeneficiaryAccounts(name, [
      bankTransferProvider,
      openBankingProvider,
      stripeProvider,
    ]);
    await paymentRequestsPage.checkAmount(name, mockAmount);
    await paymentRequestsPage.checkStatus(name, "active");
    await paymentRequestsPage.checkReference(name, mockPaymentRequestReference);
  });

  test("should not create an inactive payment request if title is missing @regression @normal", async ({
    bankTransferProvider,
    openBankingProvider,
    realexProvider,
  }) => {
    await description(
      "This test checks that a payment request is not created if title is missing.",
    );
    await owner("OGCIO");
    await tags("Payment Request", "Multiple");
    await severity(Severity.NORMAL);

    const paymentRequestsPage = new PaymentRequestsPage(page);
    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoCreate();

    const createPaymentRequestPage = new PaymentRequestFormPage(page);
    await createPaymentRequestPage.enterTitle("");
    await createPaymentRequestPage.enterDescription(paymentRequestDescription);
    await createPaymentRequestPage.selectManualBankTransferAccount(
      bankTransferProvider,
    );
    await createPaymentRequestPage.selectOpenBankingAccount(
      openBankingProvider,
    );
    await createPaymentRequestPage.selectCardAccount(realexProvider);
    await createPaymentRequestPage.enterReference(mockPaymentRequestReference);
    await createPaymentRequestPage.enterAmount(mockAmount);
    await createPaymentRequestPage.selectAllowAmountOverride();
    await createPaymentRequestPage.selectCustomAmount();
    await createPaymentRequestPage.enterRedirectURL(mockRedirectUrl);
    await createPaymentRequestPage.selectInactiveStatus();
    await createPaymentRequestPage.saveChanges();
    await createPaymentRequestPage.expectValidationError("titleRequired");
  });

  test("should not create an inactive payment request if reference is missing @regression @normal", async ({
    bankTransferProvider,
    openBankingProvider,
    realexProvider,
  }) => {
    await description(
      "This test checks that a payment request is not created if reference is missing.",
    );
    await owner("OGCIO");
    await tags("Payment Request", "Multiple");
    await severity(Severity.NORMAL);

    const paymentRequestsPage = new PaymentRequestsPage(page);
    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoCreate();

    const createPaymentRequestPage = new PaymentRequestFormPage(page);
    await createPaymentRequestPage.enterTitle(name);
    await createPaymentRequestPage.enterDescription(paymentRequestDescription);
    await createPaymentRequestPage.selectManualBankTransferAccount(
      bankTransferProvider,
    );
    await createPaymentRequestPage.selectOpenBankingAccount(
      openBankingProvider,
    );
    await createPaymentRequestPage.selectCardAccount(realexProvider);
    await createPaymentRequestPage.enterReference("");
    await createPaymentRequestPage.enterAmount(mockAmount);
    await createPaymentRequestPage.selectAllowAmountOverride();
    await createPaymentRequestPage.selectCustomAmount();
    await createPaymentRequestPage.enterRedirectURL(mockRedirectUrl);
    await createPaymentRequestPage.selectInactiveStatus();
    await createPaymentRequestPage.saveChanges();
    await createPaymentRequestPage.expectValidationError("referenceRequired");

    await paymentRequestsPage.goto();
    await paymentRequestsPage.checkHeader();
    await paymentRequestsPage.checkRequestIsNotVisible(name);
  });

  test("should not create an inactive payment request if amount is missing @regression @normal", async ({
    bankTransferProvider,
    openBankingProvider,
    realexProvider,
  }) => {
    await description(
      "This test checks that a payment request is not created if amount is missing.",
    );
    await owner("OGCIO");
    await tags("Payment Request", "Multiple");
    await severity(Severity.NORMAL);

    const paymentRequestsPage = new PaymentRequestsPage(page);
    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoCreate();

    const createPaymentRequestPage = new PaymentRequestFormPage(page);
    await createPaymentRequestPage.enterTitle(name);
    await createPaymentRequestPage.enterDescription(paymentRequestDescription);
    await createPaymentRequestPage.selectManualBankTransferAccount(
      bankTransferProvider,
    );
    await createPaymentRequestPage.selectOpenBankingAccount(
      openBankingProvider,
    );
    await createPaymentRequestPage.selectCardAccount(realexProvider);
    await createPaymentRequestPage.enterReference(mockPaymentRequestReference);
    await createPaymentRequestPage.enterAmount("");
    await createPaymentRequestPage.selectAllowAmountOverride();
    await createPaymentRequestPage.selectCustomAmount();
    await createPaymentRequestPage.enterRedirectURL(mockRedirectUrl);
    await createPaymentRequestPage.selectInactiveStatus();
    await createPaymentRequestPage.saveChanges();
    await createPaymentRequestPage.expectValidationError("amountRequired");

    await paymentRequestsPage.goto();
    await paymentRequestsPage.checkHeader();
    await paymentRequestsPage.checkRequestIsNotVisible(name);
  });

  test("should not create an inactive payment request if redirect url is missing @regression @normal", async ({
    bankTransferProvider,
    openBankingProvider,
    realexProvider,
  }) => {
    await description(
      "This test checks that a payment request is not created if redirect url is missing.",
    );
    await owner("OGCIO");
    await tags("Payment Request", "Multiple");
    await severity(Severity.NORMAL);

    const paymentRequestsPage = new PaymentRequestsPage(page);
    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoCreate();

    const createPaymentRequestPage = new PaymentRequestFormPage(page);
    await createPaymentRequestPage.enterTitle(name);
    await createPaymentRequestPage.enterDescription(paymentRequestDescription);
    await createPaymentRequestPage.selectManualBankTransferAccount(
      bankTransferProvider,
    );
    await createPaymentRequestPage.selectOpenBankingAccount(
      openBankingProvider,
    );
    await createPaymentRequestPage.selectCardAccount(realexProvider);
    await createPaymentRequestPage.enterReference(mockPaymentRequestReference);
    await createPaymentRequestPage.enterAmount(mockAmount);
    await createPaymentRequestPage.selectAllowAmountOverride();
    await createPaymentRequestPage.selectCustomAmount();
    await createPaymentRequestPage.enterRedirectURL("");
    await createPaymentRequestPage.selectInactiveStatus();
    await createPaymentRequestPage.saveChanges();
    await createPaymentRequestPage.expectValidationError("redirectURLRequired");

    await paymentRequestsPage.goto();
    await paymentRequestsPage.checkHeader();
    await paymentRequestsPage.checkRequestIsNotVisible(name);
  });

  test("should not create an active payment request if no provider is selected @regression @critical", async () => {
    await description(
      "This test checks that a payment request cannot be created as active is no provider is selected.",
    );
    await owner("OGCIO");
    await tags("Payment Request", "Multiple");
    await severity(Severity.CRITICAL);

    const paymentRequestsPage = new PaymentRequestsPage(page);
    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoCreate();

    const createPaymentRequestPage = new PaymentRequestFormPage(page);
    await createPaymentRequestPage.enterTitle(name);
    await createPaymentRequestPage.enterDescription(paymentRequestDescription);
    await createPaymentRequestPage.enterReference(mockPaymentRequestReference);
    await createPaymentRequestPage.enterAmount(mockAmount);
    await createPaymentRequestPage.selectAllowAmountOverride();
    await createPaymentRequestPage.selectCustomAmount();
    await createPaymentRequestPage.enterRedirectURL(mockRedirectUrl);
    await createPaymentRequestPage.selectActiveStatus();
    await createPaymentRequestPage.saveChanges();
    await createPaymentRequestPage.expectValidationError("statusInvalid");

    await paymentRequestsPage.goto();
    await paymentRequestsPage.checkHeader();
    await paymentRequestsPage.checkRequestIsNotVisible(name);
  });

  test("should create an inactive payment request with no provider selected @regression @normal", async ({
    context,
  }) => {
    await description(
      "This test checks the successful creation of an inactive payment request with no provider selected.",
    );
    await owner("OGCIO");
    await tags("Payment Request", "Multiple");
    await severity(Severity.NORMAL);

    const paymentRequestsPage = new PaymentRequestsPage(page);
    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoCreate();

    const createPaymentRequestPage = new PaymentRequestFormPage(page);
    await createPaymentRequestPage.enterTitle(name);
    await createPaymentRequestPage.enterDescription(paymentRequestDescription);
    await createPaymentRequestPage.enterReference(mockPaymentRequestReference);
    await createPaymentRequestPage.enterAmount(mockAmount);
    await createPaymentRequestPage.selectAllowAmountOverride();
    await createPaymentRequestPage.selectCustomAmount();
    await createPaymentRequestPage.enterRedirectURL(mockRedirectUrl);
    await createPaymentRequestPage.selectInactiveStatus();
    await createPaymentRequestPage.saveChanges();

    const detailsPage = new PaymentRequestDetailsPage(page);
    await detailsPage.checkHeader();
    await detailsPage.checkTitle(name);
    await detailsPage.checkDescription(paymentRequestDescription);
    await detailsPage.checkStatus("inactive");
    await detailsPage.checkAmount(mockAmount);
    await detailsPage.checkRedirectUrl(mockRedirectUrl);
    await detailsPage.checkAmountOverrideOption(true);
    await detailsPage.checkCustomAmountOption(true);
    await detailsPage.checkEmptyPaymentsList();

    const link = await detailsPage.getPaymentLink();
    const newPage = await context.newPage();
    await newPage.goto(link);
    const inactivePayPage = new InactivePayPage(newPage);
    await inactivePayPage.checkHeader();
    await inactivePayPage.checkDescription();

    // TODO: check request is visible in list - waiting for https://dev.azure.com/OGCIO-Digital-Services/Digital%20Services%20Programme/_boards/board/t/Payments/Stories?workitem=20445
  });
});