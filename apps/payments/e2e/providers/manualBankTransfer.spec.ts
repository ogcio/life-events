import { Page, expect } from "@playwright/test";
import { test } from "../fixtures/test";
import { mockIban } from "../utils/mocks";
import { paymentSetupUrl, providersUrl } from "../utils/constants";
import { ProvidersPage } from "../pages/providers/ProvidersPage";

test.describe("Manual bank transfer provider", () => {
  let page: Page;
  let providerName: string;

  test.beforeAll(async ({ browser, browserName }) => {
    page = await browser.newPage();
    providerName = `Test manual bank transfer ${browserName} ${new Date()}`;
  });

  test("Add bank transfer provider", async () => {
    await page.goto(paymentSetupUrl);

    const providersMenuLink = await page.getByRole("link", {
      name: "Providers",
    });
    await providersMenuLink.click();

    const providersPage = new ProvidersPage(page);
    await providersPage.addProvider(providerName, "banktransfer");
  });

  test("Edit bank transfer provider", async () => {
    const row = page.getByRole("row").filter({ hasText: providerName });
    await row.getByRole("link", { name: "edit" }).click({ force: true });
    await page.waitForLoadState();

    await expect(
      page.getByRole("heading", {
        name: "Edit Manual Bank Transfer payment provider",
      }),
    ).toBeVisible();
    const ibanInput = await page.getByRole("textbox", {
      name: /IBAN/,
    });
    await expect(ibanInput).toHaveValue(mockIban);
    const nameInput = await page.getByRole("textbox", { name: /Name/ });
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
