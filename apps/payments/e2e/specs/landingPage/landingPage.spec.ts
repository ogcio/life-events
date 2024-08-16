import { Page } from "@playwright/test";
import { test } from "@playwright/test";

import {
  Severity,
  owner,
  tags,
  severity,
  description,
} from "allure-js-commons";
import { LandingPage } from "../../objects/LandingPage";
import { landingPage2Url } from "../../utils/constants";

test.describe("Payments landing page", () => {
  let page: Page;

  const learnMoreForm =
    "https://www.forms.uat.gov.ie/en/664b6de45f7c9800231daf22";
  const feedbackLink =
    "https://www.forms.uat.gov.ie/en/664c61ba5f7c9800231db294";

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  const testLandingPage = async (landingPage: LandingPage) => {
    await landingPage.checkFeedbackLink(feedbackLink);
    await landingPage.checkCTA(learnMoreForm);

    await landingPage.checkHeader();
    await landingPage.checkHeaderBlock();

    await landingPage.checkBenefitsHeader();
    await landingPage.checkBenefitsContent();

    await landingPage.checkGetStartedBlockContent();
  };

  test("should test the Payments landing page @smoke @normal", async () => {
    await description("This test checks the Payments landing page's content");
    await owner("OGCIO");
    await tags("Landing page");
    await severity(Severity.NORMAL);

    const landingPage = new LandingPage(page);
    await landingPage.goto();

    await testLandingPage(landingPage);
  });

  test("should test the Payments landing page 2 @smoke @normal", async () => {
    await description(
      "This test checks the second Payments landing page's content",
    );
    await owner("OGCIO");
    await tags("Landing page");
    await severity(Severity.NORMAL);

    const landingPage = new LandingPage(page);
    await landingPage.goto(landingPage2Url);

    await testLandingPage(landingPage);
  });
});
