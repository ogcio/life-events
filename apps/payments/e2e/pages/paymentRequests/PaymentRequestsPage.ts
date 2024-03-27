import { type Page, type Locator } from "@playwright/test";
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

  async create(provider: PaymentRequestParams) {
    await this.createPaymentBtn.click();
    const createPaymentRequestPage = new PaymentRequestFormPage(this.page);
    await createPaymentRequestPage.create(provider);
  }
}
