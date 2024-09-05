import { type Page, type Locator, expect } from "@playwright/test";

export class PublicServantTransactionDetailsPage {
  private readonly header: Locator;

  private readonly titleLabel = "Payment Request Title";
  private readonly amountLabel = "Amount";
  private readonly statusLabel = "Status";
  private readonly providerTypeLabel = "Provider type";
  private readonly providerNameLabel = "Provider name";
  private readonly referenceLabel = "Payment reference code";
  private readonly payerNameLabel = "Payer name";
  private readonly payerMailLabel = "Payer email";
  private readonly confirmTransactionBtn: Locator;

  constructor(public readonly page: Page) {
    this.header = page.getByRole("heading", {
      name: "Payment details",
    });
    this.confirmTransactionBtn = page.getByRole("button", {
      name: "Transaction found with this reference code",
    });
  }

  async checkHeader() {
    await expect(this.header).toBeVisible();
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

  async checkProviderName(name: string) {
    await expect(
      this.page
        .locator("div")
        .filter({ hasText: this.providerNameLabel })
        .last()
        .getByText(name),
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

  async confirmTransaction() {
    await expect(this.confirmTransactionBtn).toBeVisible();
    await this.confirmTransactionBtn.click();
    await expect(this.confirmTransactionBtn).not.toBeVisible();
    await this.checkStatus("succeeded");
  }
}
