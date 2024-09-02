import { test } from "../../fixtures/pageFixtures";

import {
  Severity,
  owner,
  tags,
  severity,
  description,
} from "allure-js-commons";
import { InactivePublicServantPage } from "../../objects/inactivePublicSurvant/InactivePublicServantPage";
import { ErrorPage } from "../../objects/errorPage/ErrorPage";
import { deleteLogtoUser } from "../../utils/logto_utils";
import { MyGovIdMockLoginPage } from "../../objects/MyGovIdMockLoginPage";
import { inactivePublicServant, password } from "../../utils/constants";

test.describe("Inactive public servant page", () => {
  const baseURL = process.env.BASE_URL || "";
  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ storageState: undefined });
    await page.goto(baseURL);
    const logtoLoginBtn = await page.getByRole("button", {
      name: "Continue with MyGovId",
    });
    await logtoLoginBtn.click();
    const loginPage = new MyGovIdMockLoginPage(page);
    await loginPage.selectUser(inactivePublicServant, "publicServant");
    await loginPage.enterPassword(password);
    await loginPage.submitLogin(inactivePublicServant);
  });

  test.afterAll(async ({ request }) => {
    const cookies = await page.context().cookies();
    const userId = cookies
      .filter((cookie) => cookie.name === "logtoUserId")
      .map((cookie) => cookie.value);

    if (!userId.length) {
      console.error("User ID was not found");
      return;
    }

    await deleteLogtoUser(request, userId[0]);
  });

  test("should see a dedicated page for inactive public servants @smoke @normal", async () => {
    await description(
      "This test checks the Inactive Public Servant page's content",
    );
    await owner("OGCIO");
    await tags("Inactive public servant page");
    await severity(Severity.NORMAL);

    await page.goto("/");
    const inactivePubServentPage = new InactivePublicServantPage(page);
    await inactivePubServentPage.checPageContent();
  });

  test("should not be able to access any other pages @smoke @normal", async () => {
    await description(
      "This test checks that an inactive public servant cannot access any pages of the application",
    );
    await owner("OGCIO");
    await tags("Inactive public servant page");
    await severity(Severity.NORMAL);

    await page.goto("/en/paymentSetup");
    const page1 = new ErrorPage(page);
    await page1.checPageContent();

    await page.goto("/en/citizen/transactions");
    const page2 = new ErrorPage(page);
    await page2.checPageContent();
  });
});
