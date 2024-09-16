import { expect, Locator, Page } from "@playwright/test";
import { StripeProviderForm } from "../components/StripeProviderForm";

export class EditStripeProviderPage {
  public readonly providerForm: StripeProviderForm;
  private readonly saveButton: Locator;
  private readonly disableButton: Locator;
  private readonly enableButton: Locator;
  private readonly header: Locator;

  constructor(public readonly page: Page) {
    this.providerForm = new StripeProviderForm(page);
    this.saveButton = this.page.getByRole("button", { name: "Save" });
    this.disableButton = this.page.getByRole("button", { name: "Disable" });
    this.enableButton = this.page.getByRole("button", { name: "Enable" });
    this.header = this.page.getByRole("heading", {
      name: "Edit Stripe Payment Provider",
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
