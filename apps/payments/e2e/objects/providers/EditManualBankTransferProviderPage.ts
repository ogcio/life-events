import { expect, Locator, Page } from "@playwright/test";
import { providersUrl } from "../../utils/constants";
import { BankTransferProviderForm } from "../components/BankTransferProviderForm";

export class EditManualBankTransferProviderPage {
  public readonly providerForm: BankTransferProviderForm;
  private readonly saveButton: Locator;
  private readonly disableButton: Locator;
  private readonly enableButton: Locator;
  private readonly header: Locator;

  constructor(public readonly page: Page) {
    this.providerForm = new BankTransferProviderForm(page);
    this.saveButton = this.page.getByRole("button", { name: "Save" });
    this.disableButton = this.page.getByRole("button", { name: "Disable" });
    this.enableButton = this.page.getByRole("button", { name: "Enable" });
    this.header = this.page.getByRole("heading", {
      name: "Edit Manual Bank Transfer Payment Provider",
    });
  }

  async goto() {
    await this.page.goto(`${providersUrl}/add-banktransfer`);
  }

  async checkHeaderVisible() {
    await expect(this.header).toBeVisible();
  }

  async saveChanges() {
    await this.saveButton.click();
  }

  async disableProvider() {
    await this.disableButton.click();
  }

  async enableProvider() {
    await this.enableButton.click();
  }
}
