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

test.describe("Payment Request with stripe provider", () => {
  let name: string;

  test.beforeEach(async () => {
    name = `Test stripe ${Date.now()}`;
  });

  test("should create an inactive payment request with a stripe provider @regression @normal", async ({
    stripeProvider,
    publicServantPage,
  }) => {
    await description(
      "This test checks the successful creation of an inactive payment request with a stripe provider.",
    );
    await owner("OGCIO");
    await tags("Payment Request", "Stripe");
    await severity(Severity.NORMAL);

    const paymentRequestsPage = new PaymentRequestsPage(publicServantPage);
    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoCreate();

    const createPaymentRequestPage = new PaymentRequestFormPage(
      publicServantPage,
    );
    await createPaymentRequestPage.enterTitle(name);
    await createPaymentRequestPage.enterDescription(paymentRequestDescription);
    await createPaymentRequestPage.selectCardAccount(stripeProvider);
    await createPaymentRequestPage.enterReference(mockPaymentRequestReference);
    await createPaymentRequestPage.enterAmount(mockAmount);
    await createPaymentRequestPage.selectAllowAmountOverride();
    await createPaymentRequestPage.selectCustomAmount();
    await createPaymentRequestPage.enterRedirectURL(mockRedirectUrl);
    await createPaymentRequestPage.selectInactiveStatus();
    await createPaymentRequestPage.saveChanges();

    const detailsPage = new PaymentRequestDetailsPage(publicServantPage);
    await detailsPage.checkHeader();
    await detailsPage.checkTitle(name);
    await detailsPage.checkDescription(paymentRequestDescription);
    await detailsPage.checkStatus("inactive");
    await detailsPage.checkAccounts([{ name: stripeProvider, type: "stripe" }]);
    await detailsPage.checkAmount(mockAmount);
    await detailsPage.checkRedirectUrl(mockRedirectUrl);
    await detailsPage.checkAmountOverrideOption(true);
    await detailsPage.checkCustomAmountOption(true);
    await detailsPage.checkEmptyPaymentsList();

    const link = await detailsPage.getPaymentLink();
    const newPage = await publicServantPage.context().newPage();
    await newPage.goto(link);
    const inactivePayPage = new InactivePayPage(newPage);
    await inactivePayPage.checkHeader();
    await inactivePayPage.checkDescription();
    await newPage.close();

    await paymentRequestsPage.goto();
    await paymentRequestsPage.checkHeader();
    await paymentRequestsPage.checkRequestIsVisible(name);
    await paymentRequestsPage.checkBeneficiaryAccounts(name, [stripeProvider]);
    await paymentRequestsPage.checkAmount(name, mockAmount);
    await paymentRequestsPage.checkStatus(name, "inactive");
    await paymentRequestsPage.checkReference(name, mockPaymentRequestReference);
  });

  test("should create an active payment request with a stripe provider @smoke @critical", async ({
    stripeProvider,
    publicServantPage,
  }) => {
    await description(
      "This test checks the successful creation of an inactive payment request with a stripe provider.",
    );
    await owner("OGCIO");
    await tags("Payment Request", "Stripe");
    await severity(Severity.CRITICAL);

    const paymentRequestsPage = new PaymentRequestsPage(publicServantPage);
    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoCreate();

    const createPaymentRequestPage = new PaymentRequestFormPage(
      publicServantPage,
    );
    await createPaymentRequestPage.enterTitle(name);
    await createPaymentRequestPage.enterDescription(paymentRequestDescription);
    await createPaymentRequestPage.selectCardAccount(stripeProvider);
    await createPaymentRequestPage.enterReference(mockPaymentRequestReference);
    await createPaymentRequestPage.enterAmount(mockAmount);
    await createPaymentRequestPage.enterRedirectURL(mockRedirectUrl);
    await createPaymentRequestPage.selectActiveStatus();
    await createPaymentRequestPage.saveChanges();

    const detailsPage = new PaymentRequestDetailsPage(publicServantPage);
    await detailsPage.checkHeader();
    await detailsPage.checkTitle(name);
    await detailsPage.checkDescription(paymentRequestDescription);
    await detailsPage.checkStatus("active");
    await detailsPage.checkAccounts([{ name: stripeProvider, type: "stripe" }]);
    await detailsPage.checkAmount(mockAmount);
    await detailsPage.checkRedirectUrl(mockRedirectUrl);
    await detailsPage.checkAmountOverrideOption(false);
    await detailsPage.checkCustomAmountOption(false);
    await detailsPage.checkEmptyPaymentsList();

    const link = await detailsPage.getPaymentLink();
    const newPage = await publicServantPage.context().newPage();
    await newPage.goto(link);
    const previewPayPage = new PreviewPayPage(newPage);
    await previewPayPage.checkHeader();
    await previewPayPage.checkAmount(mockAmount);
    await previewPayPage.customAmountForm.checkCustomAmountOptionNotVisible();
    await previewPayPage.paymentMethodForm.checkPaymentMethodHeader();
    await previewPayPage.paymentMethodForm.checkPaymentMethodVisible("card");
    await previewPayPage.paymentMethodForm.checkPaymentMethodNotVisible(
      "openbanking",
    );
    await previewPayPage.paymentMethodForm.checkPaymentMethodNotVisible(
      "banktransfer",
    );
    await previewPayPage.paymentMethodForm.checkButtonDisabled();
    await newPage.close();

    await paymentRequestsPage.goto();
    await paymentRequestsPage.checkHeader();
    await paymentRequestsPage.checkRequestIsVisible(name);
    await paymentRequestsPage.checkBeneficiaryAccounts(name, [stripeProvider]);
    await paymentRequestsPage.checkAmount(name, mockAmount);
    await paymentRequestsPage.checkStatus(name, "active");
    await paymentRequestsPage.checkReference(name, mockPaymentRequestReference);
  });
});
