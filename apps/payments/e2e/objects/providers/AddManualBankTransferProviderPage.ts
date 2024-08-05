import { type Page, type Locator, expect } from "@playwright/test";
import { providersUrl } from "../../utils/constants";
import { mockAccountHolderName, mockIban } from "../../utils/mocks";

type ManualBankTransferErrors =
  | "accountHolderNameRequired"
  | "ibanRequired"
  | "ibanInvalid";

const validationErrorTexts: Record<ManualBankTransferErrors, string> = {
  accountHolderNameRequired: "Bank Account Holder Name is required.",
  ibanRequired: "IBAN is required.",
  ibanInvalid: "IBAN is not valid.",
};

export class AddManualBankTransferProviderPage {
  private readonly nameInput: Locator;
  private readonly accountHolderNameInput: Locator;
  private readonly ibanInput: Locator;
  private readonly confirmButton: Locator;

  constructor(public readonly page: Page) {
    this.nameInput = this.page.getByRole("textbox", {
      name: "Name",
      exact: true,
    });
    this.accountHolderNameInput = this.page.getByRole("textbox", {
      name: "Bank account holder name",
    });
    this.ibanInput = this.page.getByRole("textbox", {
      name: "IBAN",
    });
    this.confirmButton = this.page.getByRole("button", { name: "Confirm" });
  }

  async goto() {
    await this.page.goto(`${providersUrl}/add-banktransfer`);
  }

  async enterName(name: string) {
    await this.nameInput.fill(name);
  }
  async enterAccountHolderName(name: string) {
    await this.accountHolderNameInput.fill(name);
  }

  async enterIban(iban: string) {
    await this.ibanInput.fill(iban);
  }

  async submitProviderCreation() {
    await this.confirmButton.click();
  }

  async expectValidationError(expectedError: ManualBankTransferErrors) {
    const errorMessage = await this.page.getByText(
      validationErrorTexts[expectedError],
    );
    await expect(errorMessage).toBeVisible();
  }

  async create(name: string) {
    await this.nameInput.fill(name);
    await this.accountHolderNameInput.fill(mockAccountHolderName);
    await this.ibanInput.fill(mockIban);
    await this.confirmButton.click();

    await this.page.waitForURL(providersUrl);
  }
}
