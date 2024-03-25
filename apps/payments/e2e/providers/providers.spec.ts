import { expect } from "@playwright/test";
import { test } from "../fixtures/test";

test("should be able to add a bank transfer provider", async ({ page }) => {
  await page.goto("/en/paymentSetup");

  await page.getByRole("link", { name: "Providers" }).click();
  await page.getByRole("button", { name: "New account" }).click();
  await page
    .getByRole("button", { name: "Select Manual Bank Transfer" })
    .click();
  await page.getByLabel("Name", { exact: true }).fill("Bank1");
  await page.getByLabel("Bank account holder name").fill("Name Surname");
  await page.getByLabel("Bank sort code").fill("123456");
  await page.getByLabel("Bank account number").fill("12345678");
  await page.getByRole("button", { name: "Confirm" }).click();
  const accountName = await page.getByRole("cell", { name: "Bank1" });
  await expect(accountName).toBeVisible();
});
