import { type Page, type Locator, expect } from "@playwright/test";
import {
  PaymentRequestValidationError,
  paymentRequestValidationErrorTexts,
  paymentSetupUrl,
} from "../../utils/constants";
import {
  mockAmount,
  mockPaymentRequestReference,
  mockRedirectUrl,
  paymentRequestDescription,
} from "../../utils/mocks";

export type PaymentRequestProps = {
  title: string;
  cardProvider?: string;
  openBankingProvider?: string;
  bankTransferProvider?: string;
  status?: "active" | "inactive";
};
export class PaymentRequestFormPage {
  private readonly header: Locator;
  private readonly titleInput: Locator;
  private readonly descriptionInput: Locator;
  private readonly openBankingSelect: Locator;
  private readonly manualBankTransferSelect: Locator;
  private readonly cardSelect: Locator;
  private readonly referenceInput: Locator;
  private readonly amountInput: Locator;
  private readonly redirectURLInput: Locator;
  private readonly amountOverrideCheckbox: Locator;
  private readonly customAmountCheckbox: Locator;
  private readonly activeStatusRadioBtn: Locator;
  private readonly inactiveStatusRadioBtn: Locator;
  private readonly saveButton: Locator;

  constructor(public readonly page: Page) {
    this.header = this.page.getByRole("heading", {
      name: "Payment Request Setup Form",
    });
    this.titleInput = this.page.getByRole("textbox", { name: /Title/ });
    this.descriptionInput = this.page.getByRole("textbox", {
      name: /Description/,
    });
    this.openBankingSelect = this.page.getByLabel("OpenBanking Account");
    this.manualBankTransferSelect = this.page.getByLabel(
      "Manual Bank Transfer Account",
    );
    this.cardSelect = this.page.getByLabel("Card Payment Account");
    this.referenceInput = this.page.getByRole("textbox", { name: /Reference/ });
    this.amountInput = this.page.getByLabel("Amount", { exact: true });
    this.amountOverrideCheckbox = this.page.getByLabel(
      "Allow amount override from URL",
    );
    this.customAmountCheckbox = this.page.getByLabel(
      "Allow the user to pay a custom amount",
    );
    this.redirectURLInput = this.page.locator('input[name="redirect-url"]');
    this.activeStatusRadioBtn = this.page.getByLabel("Active", { exact: true });
    this.inactiveStatusRadioBtn = this.page.getByLabel("Inactive");
    this.saveButton = this.page.getByRole("button", { name: "Save" });
  }

  async goto() {
    await this.page.goto(`${paymentSetupUrl}/create`);
  }

  async create(props: PaymentRequestProps) {
    await this.enterTitle(props.title);
    await this.enterDescription(paymentRequestDescription);

    if (props.bankTransferProvider) {
      await this.selectManualBankTransferAccount(props.bankTransferProvider);
    }

    if (props.openBankingProvider) {
      await this.selectOpenBankingAccount(props.openBankingProvider);
    }

    if (props.cardProvider) {
      await this.selectCardAccount(props.cardProvider);
    }

    await this.enterReference(mockPaymentRequestReference);
    await this.enterAmount(mockAmount);
    await this.selectAllowAmountOverride();
    await this.selectCustomAmount();
    await this.enterRedirectURL(mockRedirectUrl);
    (await props.status) === "inactive"
      ? this.selectInactiveStatus
      : this.selectActiveStatus();
    await this.saveChanges();
  }

  async checkHeading() {
    await expect(this.header).toBeVisible();
  }

  async checkTitle(title: string) {
    expect(this.titleInput).toHaveValue(title);
  }

  async checkDescription(description: string) {
    expect(this.descriptionInput).toHaveValue(description);
  }

  async checkManualBankTransferAccount(value: string) {
    await expect(this.manualBankTransferSelect).toHaveValue(value);
  }

  async checkOpenBankingAccount(value: string) {
    await expect(this.openBankingSelect).toHaveValue(value);
  }

  async checkCardAccount(value: string) {
    await expect(this.cardSelect).toHaveValue(value);
  }

  async checkReference(ref: string) {
    expect(this.referenceInput).toHaveValue(ref);
  }

  async enterTitle(title: string) {
    await this.titleInput.clear();
    await this.titleInput.fill(title);
  }

  async enterDescription(description: string) {
    await this.descriptionInput.clear();
    await this.descriptionInput.fill(description);
  }

  async selectManualBankTransferAccount(provider: string) {
    await this.manualBankTransferSelect.selectOption(provider);
  }

  async selectOpenBankingAccount(provider: string) {
    await this.openBankingSelect.selectOption(provider);
  }

  async selectCardAccount(provider: string) {
    await this.cardSelect.selectOption(provider);
  }

  async enterReference(value: string) {
    await this.referenceInput.clear();
    await this.referenceInput.fill(value);
  }

  async enterAmount(amount: string) {
    await this.amountInput.clear();
    await this.amountInput.fill(amount);
  }

  async selectAllowAmountOverride() {
    await this.amountOverrideCheckbox.check();
  }

  async deselectAllowAmountOverride() {
    await this.amountOverrideCheckbox.uncheck();
  }

  async selectCustomAmount() {
    await this.customAmountCheckbox.check();
  }

  async deselectCustomAmount() {
    await this.customAmountCheckbox.uncheck();
  }

  async enterRedirectURL(url: string) {
    await this.redirectURLInput.clear();
    await this.redirectURLInput.fill(url);
  }

  async selectActiveStatus() {
    await this.activeStatusRadioBtn.check();
  }

  async selectInactiveStatus() {
    await this.inactiveStatusRadioBtn.check();
  }

  async saveChanges() {
    await this.saveButton.click();
  }

  async expectValidationError(expectedError: PaymentRequestValidationError) {
    const errorMessage = await this.page.getByText(
      paymentRequestValidationErrorTexts[expectedError],
    );
    await expect(errorMessage).toBeVisible();
  }
}
