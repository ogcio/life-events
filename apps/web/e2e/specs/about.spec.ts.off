import { test, expect } from "@playwright/test";
import { LoginPage } from "../objects/loginPage";
import { AboutPage } from "../objects/aboutPage";

test("It should verify that About me exists @major", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const aboutPage = new AboutPage(page);

  await page.goto("https://dev.life.gov.ie");
  await page.getByRole("textbox").click();
  await page.getByRole("textbox").fill("123");
  await loginPage.clickSubmit();
  await page.goto("https://dev.life.gov.ie");
  await page.getByLabel("events-menu").click();
  await expect(page.getByRole("list")).toContainText("About me");
});
