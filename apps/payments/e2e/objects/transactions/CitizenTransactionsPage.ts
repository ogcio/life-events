import { type Page, type Locator, expect } from "@playwright/test";
import { ManualBankTransferTransaction } from "../../fixtures/transactionsFixtures";

export class CitizenTransactionsPage {
  private readonly header: Locator;

  private readonly emptyPageTitle = "There are no payments.";
  private readonly emptyPageDescription = "You have not made any payments yet.";

  constructor(public readonly page: Page) {
    this.header = page.getByRole("heading", {
      name: "My Payments",
    });
  }

  async checkHeader() {
    await expect(this.header).toBeVisible();
  }

  async goto() {
    await this.page.goto(`/en/citizen/transactions`);
  }

  async checkTransaction(transaction: ManualBankTransferTransaction) {
    const transactionRow = await this.page.locator(
      `tr[data-reference-code="${transaction.referenceCode}"]`,
    );
    await expect(
      transactionRow.getByRole("cell", { name: transaction.amount }),
    ).toBeVisible();
    await expect(
      transactionRow.getByRole("cell", { name: transaction.status }),
    ).toBeVisible();
    await expect(
      transactionRow.getByRole("link", { name: "Details" }),
    ).toBeVisible();
  }

  async checkTransactionIsMissing(transaction: ManualBankTransferTransaction) {
    const transactionRow = await this.page.locator(
      `tr[data-reference-code="${transaction.referenceCode}"]`,
    );
    await expect(transactionRow).not.toBeVisible();
  }

  async checkEmptyTransactionsScreen() {
    const title = this.page.getByRole("heading", {
      name: this.emptyPageTitle,
    });
    const description = this.page.getByText(this.emptyPageDescription);
    await expect(title).toBeVisible();
    await expect(description).toBeVisible();
  }
}
