import { test } from "@playwright/test";

test("should be able to add a bank transfer provider", async ({ page }) => {
  await page.goto("/en/paymentSetup");

  await page.getByRole("link", { name: "Providers" }).click();
  await page.getByRole("button", { name: "New account" }).click();
  await page
    .getByRole("button", { name: "Select Manual Bank Transfer" })
    .click();
  await page.getByLabel("Name", { exact: true }).click();
  await page.getByLabel("Name", { exact: true }).fill("Bank1");
  await page.getByLabel("Bank account holder name").click();
  await page.getByLabel("Bank account holder name").fill("Name Surname");
  await page.getByLabel("Bank sort code").click();
  await page.getByLabel("Bank sort code").fill("123456");
  await page.getByLabel("Bank account number").click();
  await page.getByLabel("Bank account number").fill("12345678");
  await page.getByRole("button", { name: "Confirm" }).click();
  await page.getByRole("cell", { name: "Bank1" }).click();
});
