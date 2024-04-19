import { Page, expect } from "@playwright/test";
import { test } from "../fixtures/test";
import { mockStripePublishableKey, mockStripeSecretKey } from "../utils/mocks";
import { paymentSetupUrl, providersUrl } from "../utils/constants";
import { ProvidersPage } from "../pages/providers/ProvidersPage";

test.describe("Stripe provider", () => {
  let page: Page;
  let providerName: string;

  test.beforeAll(async ({ browser, browserName }) => {
    page = await browser.newPage();
    providerName = `Test stripe ${browserName} ${new Date()}`;
  });

  test("Add stripe provider", async () => {
    await page.goto(paymentSetupUrl);

    const providersMenuLink = await page.getByRole("link", {
      name: "Providers",
    });
    await providersMenuLink.click();

    const providersPage = new ProvidersPage(page);
    await providersPage.addProvider(providerName, "stripe");
  });

  test("Edit stripe provider", async () => {
    const row = page.getByRole("row").filter({ hasText: providerName });
    await row.getByRole("link", { name: "edit" }).click({ force: true });

    await expect(
      page.getByRole("heading", { name: "Edit Stripe Payment Provider" }),
    ).toBeVisible();
    const pubKeyInput = await page.getByRole("textbox", {
      name: "Live Publishable Key",
    });
    await expect(pubKeyInput).toHaveValue(mockStripePublishableKey);
    const secretKeyInput = await page.getByRole("textbox", {
      name: "Live Secret Key",
    });
    await expect(secretKeyInput).toHaveValue(mockStripeSecretKey);
    const nameInput = await page.getByRole("textbox", {
      name: "Name",
      exact: true,
    });
    await expect(nameInput).toHaveValue(providerName);
    await nameInput.clear();
    const newProviderName = `${providerName} edited`;
    await nameInput.fill(newProviderName);

    await page.getByRole("button", { name: "Save" }).click();

    await page.waitForURL(providersUrl);
    const accountName = await page.getByRole("cell", { name: newProviderName });
    await expect(accountName).toBeVisible();
  });
});
