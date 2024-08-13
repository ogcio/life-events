import { expect, Page } from "@playwright/test";
import { test } from "../../fixtures/paymentRequestsFixtures";
import {
  Severity,
  owner,
  tags,
  severity,
  description,
} from "allure-js-commons";
import { PaymentRequestsPage } from "../../objects/paymentRequests/PaymentRequestsListPage";
import { PaymentRequestDetailsPage } from "../../objects/paymentRequests/PaymentRequestDetailsPage";
import { MyGovIdMockLoginPage } from "../../objects/MyGovIdMockLoginPage";
import { myGovIdMockSettings, password } from "../../utils/constants";

test.describe("Transaction with manual bank transfer", () => {
  let page: Page;
  let name: string;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.beforeEach(async () => {
    name = `Test multiple ${Date.now()}`;
  });

  test("should initiate a payment with a manual bank transfer provider @smoke @blocker", async ({
    paymentRequestWithMultipleProviders,
  }) => {
    await description(
      "This test checks that a payment transaction with a manual bank transfer provider is successfully initiated by a citizen",
    );
    await owner("OGCIO");
    await tags("Transaction", "Manual Bank Transfer");
    await severity(Severity.BLOCKER);

    const paymentRequestsPage = new PaymentRequestsPage(page);
    await paymentRequestsPage.goto();
    await paymentRequestsPage.gotoDetails(paymentRequestWithMultipleProviders);

    const detailsPage = new PaymentRequestDetailsPage(page);
    const paymentLink = await detailsPage.getPaymentLink();

    const logoutLink = await page.getByRole("link", { name: "signout" });
    await logoutLink.click();

    const logtoLoginBtn = await page.getByRole("button", {
      name: "Continue with MyGovId",
    });
    await logtoLoginBtn.click();

    const loginPage = new MyGovIdMockLoginPage(page);
    await loginPage.selectCitizen(myGovIdMockSettings.citizen);
    await loginPage.enterPassword(password);
    await loginPage.submitLogin(myGovIdMockSettings.citizen);

    page.goto(paymentLink);
    await expect(page.getByText("Pay your fee")).toBeVisible();
  });
});
