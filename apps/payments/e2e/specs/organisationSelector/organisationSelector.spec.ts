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

// test.describe("Organisation selector", () => {
//   let page: Page;

//   test.beforeAll(async ({ browser }) => {
//     page = await browser.newPage();
//   });

//   test("should create an inactive payment request with a manual bank transfer provider @regression @normal", async ({
//     bankTransferProvider,
//     publicServant2Page,
//   }) => {
//     await description(
//       "This test checks the successful creation of an inactive payment request with a manual bank transfer provider.",
//     );
//     await owner("OGCIO");
//     await tags("Payment Request", "Manual Bank Transfer");
//     await severity(Severity.NORMAL);

//   });
// });
