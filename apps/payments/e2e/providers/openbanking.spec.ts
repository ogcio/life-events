import { Page, expect } from "@playwright/test";
import { test } from "../fixtures/test";
import {
  mockAccountHolderName,
  mockAccountNumber,
  mockSortCode,
} from "../utils/mocks";
import { paymentSetupPage, providersPage } from "../utils/constants";

test.describe("Open Banking provider", () => {
  let page: Page;
  let providerName: string;

  test.beforeAll(async ({ browser, browserName }) => {
    page = await browser.newPage();
    providerName = `Test open banking ${browserName}`;
  });

  test("Add open banking provider", async () => {
    await page.goto(paymentSetupPage);

    const providersMenuLink = await page.getByRole("link", {
      name: "Providers",
    });
    await providersMenuLink.click();
    const createNewAccountBtn = await page.getByRole("button", {
      name: "New account",
    });
    await createNewAccountBtn.click();
    const selectOpenBankingBtn = await page.getByRole("button", {
      name: "Select OpenBanking",
    });
    await selectOpenBankingBtn.click();

    await page.getByRole("textbox", { name: /Name/ }).fill(providerName);
    await page
      .getByRole("textbox", { name: "Bank account holder name" })
      .fill(mockAccountHolderName);
    await page
      .getByRole("textbox", { name: "Bank sort code" })
      .fill(mockSortCode);
    await page
      .getByRole("textbox", { name: "Bank account number" })
      .fill(mockAccountNumber);
    await page.getByRole("button", { name: "Confirm" }).click();

    await page.waitForURL(providersPage);
    const accountName = await page.getByRole("cell", {
      name: providerName,
      exact: true,
    });
    await expect(accountName).toBeVisible();
  });

  test("Edit open banking provider", async () => {
    const row = page
      .getByRole("row")
      .filter({ hasText: new RegExp(providerName) });
    await row.getByRole("link", { name: "edit" }).click({ force: true });

    await expect(
      page.getByRole("heading", { name: "Edit OpenBanking payment provider" }),
    ).toBeVisible();
    const sortCodeInput = await page.getByRole("textbox", {
      name: /Bank sort code/,
    });
    await expect(sortCodeInput).toHaveValue(mockSortCode);
    const accountNumberInput = await page.getByRole("textbox", {
      name: /Bank account number/,
    });
    await expect(accountNumberInput).toHaveValue(mockAccountNumber);
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
