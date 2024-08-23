import { type Page, type Locator, expect } from "@playwright/test";
import { ManualBankTransferTransaction } from "../../fixtures/transactionsFixtures";

export class CitizenTransactionDetailsPage {
  private readonly header: Locator;

  private readonly titleLabel = "Payment Request Title";
  private readonly amountLabel = "Amount";
  private readonly lastUpdateLabel = "Last update";
  private readonly statusLabel = "Status";
  private readonly providerTypeLabel = "Provider type";
  private readonly referenceLabel = "Payment reference code	";
  private readonly payerNameLabel = "Payer name";
  private readonly payerMailLabel = "Payer email";

  constructor(public readonly page: Page) {
    this.header = page.getByRole("heading", {
      name: "Payment details",
    });
  }

  async checkHeader() {
    await expect(this.header).toBeVisible();
  }

  async goto(transaction: ManualBankTransferTransaction) {
    const transactionRow = await this.page.locator(
      `tr[data-reference-code="${transaction.referenceCode}"]`,
    );
    const detailsLink = await transactionRow.getByRole("link", {
      name: "Details",
    });
    await detailsLink.click();
  }

  async checkTitle(title: string) {
    await expect(
      this.page
        .locator("div")
        .filter({ hasText: this.titleLabel })
        .last()
        .getByText(title),
    ).toBeVisible();
  }

  async checkAmount(amount: string) {
    await expect(
      this.page
        .locator("div")
        .filter({ hasText: this.amountLabel })
        .last()
        .getByText(amount),
    ).toBeVisible();
  }

  async checkStatus(status: string) {
    await expect(
      this.page
        .locator("div")
        .filter({ hasText: this.statusLabel })
        .last()
        .getByText(status),
    ).toBeVisible();
  }

  async checkProviderType(providerType: string) {
    await expect(
      this.page
        .locator("div")
        .filter({ hasText: this.providerTypeLabel })
        .last()
        .getByText(providerType),
    ).toBeVisible();
  }

  async checkReferenceCode(code: string) {
    await expect(
      this.page
        .locator("div")
        .filter({ hasText: this.referenceLabel })
        .last()
        .getByText(code),
    ).toBeVisible();
  }

  async checkPayerName(name: string) {
    await expect(
      this.page
        .locator("div")
        .filter({ hasText: this.payerNameLabel })
        .last()
        .getByText(name),
    ).toBeVisible();
  }

  async checkPayerMail(mail: string) {
    await expect(
      this.page
        .locator("div")
        .filter({ hasText: this.payerMailLabel })
        .last()
        .getByText(mail),
    ).toBeVisible();
  }
}
