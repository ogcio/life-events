import { expect, Page } from "@playwright/test";
import { test } from "../../fixtures/paymentRequestsFixtures";
import {
  Severity,
  owner,
  tags,
  severity,
  description,
} from "allure-js-commons";
import { PaymentRequestFormPage } from "../../objects/paymentRequests/PaymentRequestFormPage";
import {
  mockAmount,
  mockRedirectUrl,
  paymentRequestDescription,
} from "../../utils/mocks";
import { PaymentRequestDetailsPage } from "../../objects/paymentRequests/PaymentRequestDetailsPage";

test.describe("Edit payment Request", () => {
  let page: Page;
  let name: string;
  let updatedName: string;
  let updatedDescription: string;
  let updatedAmount: string;
  let updatedRedirectUri: string;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.beforeEach(async () => {
    name = `Test ${Date.now()}`;
    updatedName = `${name} Updated`;
    updatedDescription = `${paymentRequestDescription} updated`;
    updatedAmount = "50";
    updatedRedirectUri = `${mockRedirectUrl}/updated`;
  });

  test("should create and edit a payment request @smoke @normal", async ({
    bankTransferProvider,
    realexProvider,
    stripeProvider,
    openBankingProvider,
  }) => {
    await description(
      "This test checks the successful creation and edit of a payment request.",
    );
    await owner("OGCIO");
    await tags("Payment Request", "Edit");
    await severity(Severity.NORMAL);

    const createPaymentRequestPage = new PaymentRequestFormPage(page);
    await createPaymentRequestPage.goto();
    await createPaymentRequestPage.create({
      title: name,
      bankTransferProvider: bankTransferProvider,
      openBankingProvider: openBankingProvider,
      cardProvider: stripeProvider,
    });

    const detailsPage = new PaymentRequestDetailsPage(page);
    await detailsPage.checkHeader();
    await detailsPage.checkTitle(name);
    await detailsPage.checkDescription(paymentRequestDescription);
    await detailsPage.checkStatus("active");
    await detailsPage.checkAccounts([
      { name: bankTransferProvider, type: "banktransfer" },
      { name: stripeProvider, type: "stripe" },
    ]);
    await detailsPage.checkAmount(mockAmount);
    await detailsPage.checkRedirectUrl(mockRedirectUrl);
    await detailsPage.checkAmountOverrideOption(true);
    await detailsPage.checkCustomAmountOption(true);
    await detailsPage.checkEmptyPaymentsList();

    await detailsPage.gotoEdit();

    const editPaymentRequestPage = new PaymentRequestFormPage(page);
    await editPaymentRequestPage.enterTitle(updatedName);
    await editPaymentRequestPage.enterDescription(updatedDescription);
    await editPaymentRequestPage.deselectManualBankTransferAccount();
    await editPaymentRequestPage.selectOpenBankingAccount(openBankingProvider);
    await editPaymentRequestPage.selectCardAccount(realexProvider);
    await editPaymentRequestPage.enterAmount(updatedAmount);
    await editPaymentRequestPage.enterRedirectURL(updatedRedirectUri);
    await editPaymentRequestPage.deselectAllowAmountOverride();
    await editPaymentRequestPage.deselectCustomAmount();
    await editPaymentRequestPage.selectInactiveStatus();
    await editPaymentRequestPage.saveChanges();

    const afterEditDetailsPage = new PaymentRequestDetailsPage(page);
    await afterEditDetailsPage.checkTitle(updatedName);
    await detailsPage.checkDescription(updatedDescription);
    await detailsPage.checkAccounts([
      { name: openBankingProvider, type: "openbanking" },
      { name: realexProvider, type: "realex" },
    ]);
    await detailsPage.checkAmount(updatedAmount);
    await detailsPage.checkRedirectUrl(updatedRedirectUri);
    await detailsPage.checkAmountOverrideOption(false);
    await detailsPage.checkCustomAmountOption(false);
    await detailsPage.checkStatus("inactive");
  });

  test("should get error message if remove all providers during edit and status is active @regression @normal", async ({
    bankTransferProvider,
  }) => {
    await description(
      "This test checks if a user gets an error when removes all the providers and don't change the status to be inactive.",
    );
    await owner("OGCIO");
    await tags("Payment Request", "Edit");
    await severity(Severity.NORMAL);

    const createPaymentRequestPage = new PaymentRequestFormPage(page);
    await createPaymentRequestPage.goto();
    await createPaymentRequestPage.create({
      title: name,
      bankTransferProvider: bankTransferProvider,
    });

    const detailsPage = new PaymentRequestDetailsPage(page);

    await detailsPage.gotoEdit();

    const editPaymentRequestPage = new PaymentRequestFormPage(page);
    const editPageURL = page.url();
    await editPaymentRequestPage.deselectManualBankTransferAccount();
    await editPaymentRequestPage.saveChanges();

    const editPaymentRequestErrorPage = new PaymentRequestFormPage(page);
    await expect(editPageURL).toEqual(page.url());
    await editPaymentRequestErrorPage.expectValidationError("statusInvalid");
  });

  test("should get error message if required fields are empty @regression @normal", async ({
    bankTransferProvider,
    context,
  }) => {
    await description(
      "This test checks if a user gets validation errors when required fields are empty.",
    );
    await owner("OGCIO");
    await tags("Payment Request", "Edit");
    await severity(Severity.NORMAL);

    const createPaymentRequestPage = new PaymentRequestFormPage(page);
    await createPaymentRequestPage.goto();
    await createPaymentRequestPage.create({
      title: name,
      bankTransferProvider: bankTransferProvider,
    });

    const detailsPage = new PaymentRequestDetailsPage(page);

    await detailsPage.gotoEdit();

    const editPaymentRequestPage = new PaymentRequestFormPage(page);
    const editPageURL = page.url();
    await createPaymentRequestPage.enterTitle("");
    await createPaymentRequestPage.enterDescription("");
    await createPaymentRequestPage.enterReference("");
    await createPaymentRequestPage.enterAmount("");
    await createPaymentRequestPage.enterRedirectURL("");
    await editPaymentRequestPage.saveChanges();

    const editPaymentRequestErrorPage = new PaymentRequestFormPage(page);
    await expect(editPageURL).toEqual(page.url());
    await editPaymentRequestErrorPage.expectValidationError("titleRequired");
    await editPaymentRequestErrorPage.expectValidationError(
      "referenceRequired",
    );
    await editPaymentRequestErrorPage.expectValidationError("amountRequired");
    await editPaymentRequestErrorPage.expectValidationError(
      "redirectURLRequired",
    );
  });
});
