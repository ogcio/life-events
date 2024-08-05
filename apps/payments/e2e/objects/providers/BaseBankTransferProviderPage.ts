import { type Page, type Locator, expect } from "@playwright/test";
import { providersUrl, validationErrorTexts } from "../../utils/constants";
import { mockAccountHolderName, mockIban } from "../../utils/mocks";

type ValidationErrorTypes =
  | "accountHolderNameRequired"
  | "ibanRequired"
  | "ibanInvalid";

export class BaseBankTransferProviderPage {
  protected readonly nameInput: Locator;
  protected readonly accountHolderNameInput: Locator;
  protected readonly ibanInput: Locator;
  protected readonly confirmButton: Locator;

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
    this.confirmButton = this.page.getByRole("button", { name: "Confirm" });
  }

  async goto(url: string) {
    await this.page.goto(url);
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

  async expectValidationError(expectedError: ValidationErrorTypes) {
    const errorMessage = await this.page.getByText(
      validationErrorTexts[expectedError],
    );
    await expect(errorMessage).toBeVisible();
  }

  async create(name: string) {
    await this.enterName(name);
    await this.enterAccountHolderName(mockAccountHolderName);
    await this.enterIban(mockIban);
    await this.submitProviderCreation();

    await this.page.waitForURL(providersUrl);
  }
}
