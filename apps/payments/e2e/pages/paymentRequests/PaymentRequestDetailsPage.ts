import { type Page, type Locator } from "@playwright/test";

export class PaymentRequestDetailsPage {
  private readonly editButton: Locator;
  private readonly deleteButton: Locator;
  private readonly copyLinkButton: Locator;

  constructor(public readonly page: Page) {
    this.editButton = this.page.getByRole("button", { name: "Edit" });
    this.deleteButton = this.page.getByRole("button", { name: "Delete" });
    this.copyLinkButton = this.page.getByRole("button", { name: "Copy" });
  }

  async editPaymentRequest() {}
}
