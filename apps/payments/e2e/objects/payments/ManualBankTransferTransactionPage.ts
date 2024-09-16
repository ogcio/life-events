import { type Page, type Locator, expect } from "@playwright/test";

export class ManualBankTransferTransactionPage {
  private readonly header: Locator;
  private readonly titleLabel: Locator;
  private readonly totalLabel: Locator;
  private readonly accountNameLabel: Locator;
  private readonly ibanLabel: Locator;
  private readonly referenceCodeLabel: Locator;
  private readonly referenceCodeInfo: Locator;
  private readonly confirmBtn: Locator;

  constructor(public readonly page: Page) {
    this.header = page.getByRole("heading", {
      name: "Pay with a Manual Bank Transfer",
    });
    this.titleLabel = page.getByText("Title", { exact: true });
    this.totalLabel = page.getByText("Total to pay", { exact: true });
    this.accountNameLabel = page.getByText("Name on the account", {
      exact: true,
    });
    this.ibanLabel = page.getByText("IBAN", { exact: true });
    this.referenceCodeLabel = page.getByText("Payment reference code*", {
      exact: true,
    });
    this.referenceCodeInfo = page.getByText(
      "*Please use this reference code when making the money transfer, we will use it to identify your payment. If you forget to include it, your payment may not be processed correctly.",
    );
    this.confirmBtn = page.getByRole("button", {
      name: "I have made the payment",
    });
  }

  async checkHeader() {
    await expect(this.header).toBeVisible();
  }

  async checkTitle(title: string) {
    await expect(this.titleLabel).toBeVisible();
    await expect(this.page.getByText(title, { exact: true })).toBeVisible();
  }

  async checkTotal(total: string) {
    await expect(this.totalLabel).toBeVisible();
    await expect(
      this.page.getByText(`€${total}`, { exact: true }),
    ).toBeVisible();
  }

  async checkAccountName(name: string) {
    await expect(this.accountNameLabel).toBeVisible();
    await expect(this.page.getByText(name, { exact: true })).toBeVisible();
  }

  async checkIban(iban: string) {
    await expect(this.ibanLabel).toBeVisible();
    await expect(this.page.getByText(iban, { exact: true })).toBeVisible();
  }

  async checkReferenceCode() {
    await expect(this.referenceCodeLabel).toBeVisible();
    await expect(this.referenceCodeInfo).toBeVisible();
  }

  async getPaymentRequestTitle() {
    const title = await this.page
      .locator("div")
      .filter({ hasText: "Title" })
      .last()
      .locator("dt")
      .last();
    await expect(title).toBeVisible();
    return (await title.innerText()).trim();
  }

  async getReferenceCode() {
    const referenceCodeCell = await this.page
      .locator("div")
      .filter({ hasText: "Payment reference code*" })
      .last()
      .locator("dt")
      .last();
    await expect(referenceCodeCell).toBeVisible();
    return (await referenceCodeCell.innerText()).trim();
  }

  async getAmount() {
    const amountCell = await this.page
      .locator("div")
      .filter({ hasText: "Total to pay" })
      .last()
      .locator("dt")
      .last();
    await expect(amountCell).toBeVisible();
    return amountCell.innerText();
  }

  async confirmPayment() {
    await this.confirmBtn.click();
  }
}
