import { type Page, type Locator, expect } from "@playwright/test";
import { providerTypeAccountLabelMap } from "../../utils";
import { ProviderType } from "../../../app/[locale]/(hosted)/paymentSetup/providers/types";

export class PaymentRequestDetailsPage {
  private readonly header: Locator;
  private readonly editButton: Locator;
  private readonly deleteButton: Locator;
  private readonly titleLabel: Locator;
  private readonly descriptionLabel: Locator;
  private readonly statusLabel: Locator;
  private readonly amountLabel: Locator;
  private readonly redirectURLLabel: Locator;
  private readonly dynamicAmountLabel: Locator;
  private readonly customAmountLabel: Locator;
  private readonly paymentLinkLabel: Locator;
  private readonly paymentLink: Locator;
  private readonly status: (status: string) => Locator;
  private readonly allowDynamicAmount: (value: string) => Locator;
  private readonly allowCustomAmount: (value: string) => Locator;

  constructor(public readonly page: Page) {
    this.header = this.page.getByRole("heading", {
      name: "Payment request details",
    });
    this.editButton = this.page.getByRole("button", { name: "Edit" });
    this.deleteButton = this.page.getByRole("button", { name: "Delete" });
    this.titleLabel = this.page.getByText("Title");
    this.descriptionLabel = this.page.getByText("Description");
    this.statusLabel = this.page.getByText("Status");
    this.amountLabel = this.page.getByText("Amount", { exact: true });
    this.redirectURLLabel = this.page.getByText("Redirect URL");
    this.dynamicAmountLabel = this.page.getByText("Allow dynamic amount");
    this.customAmountLabel = this.page.getByText(
      "Allow the user to pay a custom amount",
    );
    this.paymentLinkLabel = this.page.getByText("Payment link");
    this.paymentLink = this.page
      .locator("div")
      .filter({ hasText: "Payment link" })
      .last()
      .getByRole("link");
    this.status = (status: string) =>
      this.page
        .locator("div")
        .filter({ hasText: "Status" })
        .last()
        .getByText(status);
    this.allowDynamicAmount = (value: string) =>
      this.page
        .locator("div")
        .filter({ hasText: "Allow dynamic amount" })
        .last()
        .getByText(value);
    this.allowCustomAmount = (value: string) =>
      this.page
        .locator("div")
        .filter({ hasText: "Allow the user to pay a custom amount" })
        .last()
        .getByText(value);
  }

  async gotoEdit() {
    await this.editButton.click();
  }

  async checkHeader() {
    await expect(this.header).toBeVisible();
  }

  async checkTitle(name: string) {
    await expect(this.titleLabel).toBeVisible();
    await expect(this.page.getByText(name)).toBeVisible();
  }

  async checkDescription(description: string) {
    await expect(this.descriptionLabel).toBeVisible();
    await expect(this.page.getByText(description)).toBeVisible();
  }

  async checkStatus(status: string) {
    await expect(this.statusLabel).toBeVisible();
    await expect(this.status(status)).toBeVisible();
  }

  async checkAccounts(
    providers: {
      name: string;
      type: ProviderType;
    }[],
  ) {
    await Promise.all(
      providers.map((provider) =>
        expect(
          this.page
            .locator("div")
            .filter({ hasText: providerTypeAccountLabelMap[provider.type] })
            .last()
            .getByText(provider.name),
        ).toBeVisible(),
      ),
    );
  }

  async checkAmount(amount: string) {
    await expect(this.amountLabel).toBeVisible();
    await expect(this.page.getByText(amount)).toBeVisible();
  }

  async checkRedirectUrl(url: string) {
    await expect(this.redirectURLLabel).toBeVisible();
    await expect(this.page.getByText(url)).toBeVisible();
  }

  async checkDynamicAmountOption(bool: boolean) {
    await expect(this.dynamicAmountLabel).toBeVisible();
    await expect(this.allowDynamicAmount(bool.toString())).toBeVisible();
  }

  async checkCustomAmountOption(bool: boolean) {
    await expect(this.customAmountLabel).toBeVisible();
    await expect(this.allowCustomAmount(bool.toString())).toBeVisible();
  }

  async checkEmptyPaymentsList() {
    await expect(
      this.page.getByRole("heading", { name: "Payments Received" }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("heading", { name: "There are no payments yet" }),
    ).toBeVisible();
    await expect(
      this.page.getByText(
        "You have not received any payments yet for this request",
      ),
    ).toBeVisible();
  }

  async delete() {
    await this.deleteButton.click();
  }

  async confirmDelete() {
    await expect(
      this.page.getByRole("heading", { name: "Delete Payment Request" }),
    ).toBeVisible();
    await expect(
      this.page.getByText(
        "Are you sure you want to delete this payment request?",
      ),
    ).toBeVisible();
    await expect(
      this.page.getByRole("button", { name: "Cancel" }),
    ).toBeVisible();
    const deleteButtonInModal = await this.page
      .locator("form")
      .filter({ hasText: "Delete Payment Request" })
      .getByRole("button", { name: "Delete" });
    await expect(deleteButtonInModal).toBeVisible();
    await deleteButtonInModal.click();
  }

  async checkDeleteDisabled() {
    await expect(this.deleteButton).toBeDisabled();
    await this.deleteButton.hover();
    await this.page.getByText(
      "Cannot delete payment request since there are existing transactions",
    );
  }

  async getPaymentLink() {
    await expect(this.paymentLinkLabel).toBeVisible();
    return (await this.paymentLink.textContent()) ?? "";
  }

  async checkPaymentsList(
    transactions: {
      amount: string;
      status: string;
      referenceCode: string;
    }[],
  ) {
    await expect(
      this.page.getByRole("heading", { name: "Payments Received" }),
    ).toBeVisible();

    const tableHeaders = ["Status", "Date", "Amount", "Actions"];
    for (const header of tableHeaders) {
      const columnHeader = await this.page.getByRole("columnheader", {
        name: header,
      });
      await expect(columnHeader).toBeVisible();
    }

    for (const transaction of transactions) {
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
  }
}
