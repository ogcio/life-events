import { type Page, type Locator } from "@playwright/test";
import { providersUrl } from "../../utils/constants";
import { mockAccountHolderName, mockIban } from "../../utils/mocks";

export class AddOpenBankingProviderPage {
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
      name: "Bank Account Holder Name",
    });
    this.ibanInput = this.page.getByRole("textbox", {
      name: "IBAN",
    });
    this.confirmButton = this.page.getByRole("button", { name: "Confirm" });
  }

  async goto() {
    await this.page.goto(`${providersUrl}/add-openbanking`);
  }

  async create(name: string) {
    await this.nameInput.fill(name);
    await this.accountHolderNameInput.fill(mockAccountHolderName);
    await this.ibanInput.fill(mockIban);
    await this.confirmButton.click();

    await this.page.waitForURL(providersUrl);
  }
}
