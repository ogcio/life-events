import { type Page, type Locator, expect } from "@playwright/test";
import {
  mockAmount,
  mockDescription,
  mockRedirectUrl,
} from "../../utils/mocks";
import { PaymentRequestParams } from "./PaymentRequestsPage";
import { formatCurrency } from "../../../app/utils";
import { providerTypeAccountLabelMap } from "../../utils";
import { PaymentRequestFormPage } from "./PaymentRequestFormPage";

export class PaymentRequestDetailsPage {
  private readonly editButton: Locator;
  private readonly deleteButton: Locator;
  private readonly paymentLink: Locator;
  private readonly amountText: Locator;
  private readonly redirectURL: Locator;
  private readonly allowAmountOverride: (value: string) => Locator;
  private readonly allowCustomAmount: (value: string) => Locator;

  constructor(public readonly page: Page) {
    this.editButton = this.page.getByRole("button", { name: "Edit" });
    this.deleteButton = this.page.getByRole("button", { name: "Delete" });
    this.paymentLink = this.page
      .locator("div")
      .filter({ hasText: "Payment link" })
      .last()
      .getByRole("link");
    this.amountText = this.page.getByText(
      formatCurrency(parseInt(mockAmount, 10) * 100),
    );
    this.redirectURL = this.page.getByText(mockRedirectUrl);
    this.allowAmountOverride = (value: string) =>
      this.page
        .locator("div")
        .filter({ hasText: "Allow amount override from url" })
        .last()
        .getByText(value);
    this.allowCustomAmount = (value: string) =>
      this.page
        .locator("div")
        .filter({ hasText: "Allow the user to pay a custom amount" })
        .last()
        .getByText(value);
  }

  async verifyDetails(request: PaymentRequestParams) {
    await expect(this.page.getByText(request.name)).toBeVisible();
    await expect(this.page.getByText(mockDescription)).toBeVisible();
    await Promise.all(
      request.providers.map(
        async (provider) =>
          await this.page
            .locator("div")
            .filter({ hasText: providerTypeAccountLabelMap[provider.type] })
            .last()
            .getByText(provider.name),
      ),
    );
    await expect(this.amountText).toBeVisible();
    await expect(this.redirectURL).toBeVisible();
    await expect(
      this.allowAmountOverride(request.allowAmountOverride.toString()),
    ).toBeVisible();
    await expect(
      this.allowCustomAmount(request.allowCustomAmount.toString()),
    ).toBeVisible();
    await expect(this.paymentLink).toBeVisible();
  }

  async edit(name: string) {
    await this.editButton.click({ force: true });
    const editPaymentRequestPage = new PaymentRequestFormPage(this.page);
    await editPaymentRequestPage.edit(name);
    await expect(this.page.getByText(name)).toBeVisible();
  }

  async delete() {
    await this.deleteButton.click({ force: true });
  }

  async openLink() {
    await this.paymentLink.click();
  }
}
