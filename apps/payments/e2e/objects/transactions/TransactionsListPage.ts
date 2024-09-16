import { type Page, type Locator, expect } from "@playwright/test";
import { Transaction } from "../../fixtures/transactionsFixtures";
import { paymentSetupUrl } from "../../utils/constants";

export class TransactionsListPage {
  private readonly header: Locator;
  private readonly isCitizen: boolean;
  private readonly emptyPageTitle = "There are no payments.";
  private readonly emptyPageDescription: string;
  private readonly addProviderBtn: Locator;

  constructor(
    public readonly page: Page,
    { isCitizen }: { isCitizen: boolean },
  ) {
    this.header = page.getByRole("heading", {
      name: `${isCitizen ? "My " : ""}Payments`,
      exact: true,
    });
    this.isCitizen = isCitizen;
    this.emptyPageDescription = isCitizen
      ? "You have not made any payments yet."
      : "You have not received any payments yet";
    this.addProviderBtn = page.getByRole("button", {
      name: "Start by adding a payment provider",
    });
  }

  async checkHeader() {
    await expect(this.header).toBeVisible();
  }

  async goto() {
    await this.page.goto(
      this.isCitizen ? "en/citizen/transactions" : paymentSetupUrl,
    );
  }

  async gotoDetails(transaction: Transaction) {
    const transactionRow = await this.page.locator(
      `tr[data-reference-code="${transaction.referenceCode}"]`,
    );
    const detailsLink = await transactionRow.getByRole("link", {
      name: "Details",
    });
    await detailsLink.click();
  }

  async checkTransaction(transaction: Transaction) {
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

  async checkTransactionIsMissing(transaction: Transaction) {
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
    if (!this.isCitizen) await expect(this.addProviderBtn).toBeVisible();
  }
}
