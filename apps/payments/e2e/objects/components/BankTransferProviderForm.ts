import { expect, Locator, Page } from "@playwright/test";
import {
  BankTransferProviderValidationError,
  providerValidationErrorTexts,
} from "../../utils/constants";

export class BankTransferProviderForm {
  readonly nameInput: Locator;
  readonly accountHolderNameInput: Locator;
  readonly ibanInput: Locator;

  constructor(public readonly page: Page) {
    this.nameInput = this.page.getByRole("textbox", {
      name: "Name",
      exact: true,
    });
    this.accountHolderNameInput = this.page.getByRole("textbox", {
      name: "Bank Account Holder Name",
    });
    this.ibanInput = this.page.getByRole("textbox", {
      name: "IBAN",
    });
  }

  async enterName(name: string) {
    await this.nameInput.clear();
    await this.nameInput.fill(name);
  }

  async enterAccountHolderName(name: string) {
    await this.accountHolderNameInput.clear();
    await this.accountHolderNameInput.fill(name);
  }

  async enterIban(iban: string) {
    await this.ibanInput.clear();
    await this.ibanInput.fill(iban);
  }

  async checkName(name: string) {
    await expect(this.nameInput).toHaveValue(name);
  }

  async checkAccountHolderName(name: string) {
    await expect(this.accountHolderNameInput).toHaveValue(name);
  }

  async checkIban(iban: string) {
    await expect(this.ibanInput).toHaveValue(iban);
  }

  async expectValidationError(
    expectedError: BankTransferProviderValidationError,
  ) {
    const errorMessage = await this.page.getByText(
      providerValidationErrorTexts[expectedError],
    );
    await expect(errorMessage).toBeVisible();
  }
}
