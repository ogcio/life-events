import { expect, Locator, Page } from "@playwright/test";
import { RealexProviderForm } from "../components/RealexProviderForm";

export class EditRealexProviderPage {
  public readonly providerForm: RealexProviderForm;
  private readonly saveButton: Locator;
  private readonly disableButton: Locator;
  private readonly enableButton: Locator;
  private readonly header: Locator;

  constructor(public readonly page: Page) {
    this.providerForm = new RealexProviderForm(page);
    this.saveButton = this.page.getByRole("button", { name: "Save" });
    this.disableButton = this.page.getByRole("button", { name: "Disable" });
    this.enableButton = this.page.getByRole("button", { name: "Enable" });
    this.header = this.page.getByRole("heading", {
      name: "Edit Realex Provider",
    });
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
