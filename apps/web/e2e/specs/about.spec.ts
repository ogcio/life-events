import { test, expect } from "@playwright/test";
import { LoginPage } from "../objects/loginPage";
import { AboutPage } from "../objects/aboutPage";

test("It should verify that About me exists @major", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const aboutPage = new AboutPage(page);

  await page.goto(
    "http://localhost:3005/auth?redirectUrl=http://localhost:3000/",
  );
  await page.getByRole("textbox").click();
  await page.getByRole("textbox").fill("123");
  await loginPage.clickSubmit();
  await page.goto("http://localhost:3000/en/welcome?redirect_url=%2Fen");
  await page.getByLabel("events-menu").click();
  await expect(page.getByRole("list")).toContainText("About me");
});
