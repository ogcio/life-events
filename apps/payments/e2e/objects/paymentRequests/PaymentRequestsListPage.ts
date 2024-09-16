import { type Page, type Locator, expect } from "@playwright/test";
import { paymentRequestUrl } from "../../utils/constants";

export class PaymentRequestsPage {
  private readonly createBtn: Locator;
  private readonly header: Locator;

  constructor(public readonly page: Page) {
    this.createBtn = this.page.getByRole("button", {
      name: "Create payment",
    });
    this.header = this.page.getByRole("heading", {
      name: "Payment requests",
    });
  }

  async goto() {
    await this.page.goto(paymentRequestUrl);
  }

  async checkRequestIsVisible(name: string) {
    await expect(this.page.getByRole("cell", { name })).toBeVisible();
  }

  async checkRequestIsNotVisible(name: string) {
    await expect(this.page.getByText(name)).not.toBeVisible();
  }

  async gotoDetails(name: string) {
    await this.page
      .getByRole("row")
      .filter({ hasText: name })
      .getByRole("link", { name: "Details" })
      .click();
  }

  async gotoCreate() {
    await this.createBtn.click();
  }

  async checkHeader() {
    await expect(this.header).toBeVisible();
  }

  async checkBeneficiaryAccounts(name: string, accounts: string[]) {
    const accountsCell = await this.page
      .getByRole("row")
      .filter({ hasText: name })
      .getByRole("cell")
      .nth(1);
    await Promise.all(
      accounts.map((a) => expect(accountsCell).toContainText(a)),
    );
  }

  async checkAmount(name: string, amount: string) {
    const amountCell = this.page
      .getByRole("row")
      .filter({ hasText: name })
      .getByRole("cell", { name: amount });
    await expect(amountCell).toBeVisible();
  }

  async checkReference(name: string, ref: string) {
    const referenceCell = this.page
      .getByRole("row")
      .filter({ hasText: name })
      .getByRole("cell", { name: ref });
    await expect(referenceCell).toBeVisible();
  }

  async checkStatus(name: string, status: string) {
    const statusCell = this.page
      .getByRole("row")
      .filter({ hasText: name })
      .getByRole("cell", { name: status });
    await expect(statusCell).toBeVisible();
  }
}
