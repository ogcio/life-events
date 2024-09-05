import { test } from "../../fixtures/pageFixtures";

import {
  Severity,
  owner,
  tags,
  severity,
  description,
} from "allure-js-commons";
import { ErrorPage } from "../../objects/errorPage/ErrorPage";
import { MyGovIdMockLoginPage } from "../../objects/MyGovIdMockLoginPage";
import { password } from "../../utils/constants";
import { expect } from "@playwright/test";

test.describe("Explorer page", () => {
  test("should see the explorer page for public servants @smoke @normal", async ({
    publicServantPage,
  }) => {
    await description(
      "This test checks that public servants can see file explorer with upload button",
    );
    await owner("OGCIO");
    await tags("Explorer page");
    await severity(Severity.NORMAL);

    await publicServantPage.goto("/");
    await expect(
      await publicServantPage.getByText("Files", { exact: true }),
    ).toBeVisible();
  });
});
