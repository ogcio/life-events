import { expect } from "@playwright/test";
import { test } from "../../fixtures/paymentRequestsFixtures";
import {
  Severity,
  owner,
  tags,
  severity,
  description,
} from "allure-js-commons";
import { PaymentRequestFormPage } from "../../objects/paymentRequests/PaymentRequestFormPage";
import { mockRedirectUrl, paymentRequestDescription } from "../../utils/mocks";
import { PaymentRequestDetailsPage } from "../../objects/paymentRequests/PaymentRequestDetailsPage";

test.describe("Edit payment Request", () => {
  let name: string;
  let updatedName: string;
  const updatedDescription = `${paymentRequestDescription} updated`;
  const updatedAmount = "50.00";
  const updatedRedirectUri = `${mockRedirectUrl}/updated`;

  test.beforeEach(async () => {
    name = `Test ${Date.now()}`;
    updatedName = `${name} Updated`;
  });

  test("should create and edit a payment request @smoke @normal", async ({
    bankTransferProvider,
    realexProvider,
    stripeProvider,
    openBankingProvider,
    publicServantPage,
  }) => {
    await description(
      "This test checks the successful creation and edit of a payment request.",
    );
    await owner("OGCIO");
    await tags("Payment Request", "Edit");
    await severity(Severity.NORMAL);

    const createPaymentRequestPage = new PaymentRequestFormPage(
      publicServantPage,
    );
    await createPaymentRequestPage.goto();
    await createPaymentRequestPage.create({
      title: name,
      bankTransferProvider: bankTransferProvider.name,
      cardProvider: stripeProvider,
    });

    const detailsPage = new PaymentRequestDetailsPage(publicServantPage);
    await detailsPage.gotoEdit();

    const editPaymentRequestPage = new PaymentRequestFormPage(
      publicServantPage,
    );
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

    const afterEditDetailsPage = new PaymentRequestDetailsPage(
      publicServantPage,
    );
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
    publicServantPage,
  }) => {
    await description(
      "This test checks if a user gets an error when removes all the providers and don't change the status to be inactive.",
    );
    await owner("OGCIO");
    await tags("Payment Request", "Edit");
    await severity(Severity.NORMAL);

    const createPaymentRequestPage = new PaymentRequestFormPage(
      publicServantPage,
    );
    await createPaymentRequestPage.goto();
    await createPaymentRequestPage.create({
      title: name,
      bankTransferProvider: bankTransferProvider.name,
    });

    const detailsPage = new PaymentRequestDetailsPage(publicServantPage);
    await detailsPage.gotoEdit();

    const editPaymentRequestPage = new PaymentRequestFormPage(
      publicServantPage,
    );
    const editPageURL = publicServantPage.url();
    await editPaymentRequestPage.deselectManualBankTransferAccount();
    await editPaymentRequestPage.saveChanges();

    const editPaymentRequestErrorPage = new PaymentRequestFormPage(
      publicServantPage,
    );
    await expect(editPageURL).toEqual(publicServantPage.url());
    await editPaymentRequestErrorPage.expectValidationError("statusInvalid");
  });

  test("should get error message if required fields are empty @regression @normal", async ({
    bankTransferProvider,
    publicServantPage,
  }) => {
    await description(
      "This test checks if a user gets validation errors when required fields are empty.",
    );
    await owner("OGCIO");
    await tags("Payment Request", "Edit");
    await severity(Severity.NORMAL);

    const createPaymentRequestPage = new PaymentRequestFormPage(
      publicServantPage,
    );
    await createPaymentRequestPage.goto();
    await createPaymentRequestPage.create({
      title: name,
      bankTransferProvider: bankTransferProvider.name,
    });

    const detailsPage = new PaymentRequestDetailsPage(publicServantPage);

    await detailsPage.gotoEdit();

    const editPaymentRequestPage = new PaymentRequestFormPage(
      publicServantPage,
    );
    const editPageURL = publicServantPage.url();
    await editPaymentRequestPage.enterTitle("");
    await editPaymentRequestPage.enterDescription("");
    await editPaymentRequestPage.enterReference("");
    await editPaymentRequestPage.enterAmount("");
    await editPaymentRequestPage.enterRedirectURL("");
    await editPaymentRequestPage.saveChanges();

    const editPaymentRequestErrorPage = new PaymentRequestFormPage(
      publicServantPage,
    );
    await expect(editPageURL).toEqual(publicServantPage.url());
    await editPaymentRequestErrorPage.expectValidationError("titleRequired");
    await editPaymentRequestErrorPage.expectValidationError(
      "referenceRequired",
    );
    await editPaymentRequestErrorPage.expectValidationError("amountRequired");
    await editPaymentRequestErrorPage.expectValidationError(
      "redirectURLRequired",
    );

    // Amount maximum validation
    await editPaymentRequestPage.enterAmount("10001");
    await editPaymentRequestPage.saveChanges();
    await editPaymentRequestErrorPage.expectValidationError("amountMaximum");
  });
});
