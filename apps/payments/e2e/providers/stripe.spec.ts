import { Page, expect } from "@playwright/test";
import { test } from "../fixtures/test";
import { mockStripePublishableKey, mockStripeSecretKey } from "../utils/mocks";
import { paymentSetupPage, providersPage } from "../utils/constants";

test.describe("Stripe provider", () => {
  let page: Page;
  let providerName: string;

  test.beforeAll(async ({ browser, browserName }) => {
    page = await browser.newPage();
    providerName = `Test stripe ${browserName}`;
  });

  test("Add stripe provider", async () => {
    await page.goto(paymentSetupPage);

    const providersMenuLink = await page.getByRole("link", {
      name: "Providers",
    });
    await providersMenuLink.click();
    const createNewAccountBtn = await page.getByRole("button", {
      name: "New account",
    });
    await createNewAccountBtn.click();
    const selectStripeBtn = await page.getByRole("button", {
      name: "Select Stripe",
    });
    await selectStripeBtn.click();

    await page.getByRole("textbox", { name: /Name/ }).fill(providerName);
    await page
      .getByRole("textbox", { name: "Live Publishable Key" })
      .fill(mockStripePublishableKey);
    await page
      .getByRole("textbox", { name: "Live Secret Key" })
      .fill(mockStripeSecretKey);
    await page.getByRole("button", { name: "Confirm" }).click();

    await page.waitForURL(providersPage);
    const accountName = await page.getByRole("cell", {
      name: providerName,
      exact: true,
    });
    await expect(accountName).toBeVisible();
  });

  test("Edit stripe provider", async () => {
    const row = page
      .getByRole("row")
      .filter({ hasText: new RegExp(providerName) });
    await row.getByRole("link", { name: "edit" }).click({ force: true });

    await expect(
      page.getByRole("heading", { name: "Edit Stripe payment provider" }),
    ).toBeVisible();
    const pubKeyInput = await page.getByRole("textbox", {
      name: "Live Publishable Key",
    });
    await expect(pubKeyInput).toHaveValue(mockStripePublishableKey);
    const secretKeyInput = await page.getByRole("textbox", {
      name: "Live Secret Key",
    });
    await expect(secretKeyInput).toHaveValue(mockStripeSecretKey);
    const nameInput = await page.getByRole("textbox", { name: /Name/ });
    await expect(nameInput).toHaveValue(providerName);
    await nameInput.clear();
    const newProviderName = `${providerName} edited`;
    await nameInput.fill(newProviderName);

    await page.getByRole("button", { name: "Save" }).click();

    await page.waitForURL(providersPage);
    const accountName = await page.getByRole("cell", { name: newProviderName });
    await expect(accountName).toBeVisible();
  });
});
