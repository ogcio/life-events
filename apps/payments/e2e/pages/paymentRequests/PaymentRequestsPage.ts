import { type Page, type Locator, expect } from "@playwright/test";
import { paymentRequestUrl } from "../../utils/constants";
import { PaymentRequestFormPage } from "./PaymentRequestFormPage";
import { ProviderType } from "../../../app/[locale]/(hosted)/paymentSetup/providers/types";

export type PaymentRequestParams = {
  providers: {
    name: string;
    type: ProviderType;
  }[];
  name: string;
  allowAmountOverride: boolean;
  allowCustomAmount: boolean;
};

export class PaymentRequestsPage {
  private readonly createPaymentBtn: Locator;

  constructor(public readonly page: Page) {
    this.createPaymentBtn = this.page.getByRole("button", {
      name: "Create payment",
    });
  }

  async goto() {
    await this.page.goto(paymentRequestUrl);
  }

  async create(paymentRequest: PaymentRequestParams) {
    await this.createPaymentBtn.click({ force: true });
    const createPaymentRequestPage = new PaymentRequestFormPage(this.page);
    await createPaymentRequestPage.create(paymentRequest);

    await expect(
      this.page.getByRole("heading", { name: "Payment details" }),
    ).toBeVisible({ timeout: 10000 });
  }
}
