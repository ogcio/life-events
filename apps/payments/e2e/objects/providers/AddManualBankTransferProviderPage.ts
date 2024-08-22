import { Locator, Page } from "@playwright/test";
import { providersUrl } from "../../utils/constants";
import { BankTransferProviderForm } from "../components/BankTransferProviderForm";
import { mockAccountHolderName, mockIban } from "../../utils/mocks";

export class AddManualBankTransferProviderPage {
  public readonly providerForm: BankTransferProviderForm;
  private readonly confirmButton: Locator;

  constructor(public readonly page: Page) {
    this.providerForm = new BankTransferProviderForm(page);
    this.confirmButton = this.page.getByRole("button", { name: "Confirm" });
  }

  async goto() {
    await this.page.goto(`${providersUrl}/add-banktransfer`);
  }

  async submitProviderCreation() {
    await this.confirmButton.click();
  }

  async create(name: string) {
    await this.providerForm.enterName(name);
    await this.providerForm.enterAccountHolderName(mockAccountHolderName);
    await this.providerForm.enterIban(mockIban);
    await this.submitProviderCreation();

    await this.page.waitForURL(providersUrl);
  }
}
