import { type Page, type Locator } from "@playwright/test";
import { providersUrl } from "../../utils/constants";
import {
  mockAccountHolderName,
  mockAccountNumber,
  mockSortCode,
} from "../../utils/mocks";

export class AddManualBankTransferProviderPage {
  private readonly nameInput: Locator;
  private readonly accountHolderNameInput: Locator;
  private readonly sortCodeInput: Locator;
  private readonly accountNumberInput: Locator;
  private readonly confirmButton: Locator;

  constructor(public readonly page: Page) {
    this.nameInput = this.page.getByRole("textbox", { name: /Name/ });
    this.accountHolderNameInput = this.page.getByRole("textbox", {
      name: "Bank account holder name",
    });
    this.sortCodeInput = this.page.getByRole("textbox", {
      name: "Bank sort code",
    });
    this.accountNumberInput = this.page.getByRole("textbox", {
      name: "Bank account number",
    });
    this.confirmButton = this.page.getByRole("button", { name: "Confirm" });
  }

  async goto() {
    await this.page.goto(`${providersUrl}/add-banktransfer`);
  }

  async create(name: string) {
    await this.nameInput.fill(name);
    await this.accountHolderNameInput.fill(mockAccountHolderName);
    await this.sortCodeInput.fill(mockSortCode);
    await this.accountNumberInput.fill(mockAccountNumber);
    await this.confirmButton.click();

    await this.page.waitForURL(providersUrl);
  }
}
