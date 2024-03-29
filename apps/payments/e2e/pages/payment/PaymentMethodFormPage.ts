import { type Page, type Locator, expect } from "@playwright/test";
import { formatCurrency } from "../../../app/utils";
import {
  PaymentMethod,
  paymentMethodCheckboxLabelMap,
  paymentMethods,
  providerPaymentMethodMap,
} from "../../utils";
import { ProviderType } from "../../../app/[locale]/(hosted)/paymentSetup/providers/types";

export class PaymentMethodFormPage {
  private readonly title: Locator;
  private readonly amountText: (amount: number) => Locator;
  private readonly nameInput: Locator;
  private readonly emailInput: Locator;
  private readonly paymentMethodHeader: Locator;
  private readonly confirmButton: Locator;

  constructor(public readonly page: Page) {
    this.title = page.getByRole("heading", { name: "Pay your fee" });
    this.amountText = (amount: number) =>
      page.getByText(formatCurrency(amount * 100));
    this.nameInput = page.getByRole("textbox", { name: "Full Name" });
    this.emailInput = page.getByRole("textbox", { name: "Email" });
    this.paymentMethodHeader = page.getByRole("heading", {
      name: "Choose payment method",
    });
    this.confirmButton = page.getByRole("button", { name: "Confirm method" });
  }

  async verifyAmount(amount: number) {
    await expect(this.title).toBeVisible();
    await expect(this.amountText(amount)).toBeVisible();
  }

  async verifyAvailableMethods(providers: ProviderType[]) {
    const enabledMethods = new Set(
      providers.map((p) => providerPaymentMethodMap[p]),
    );
    await Promise.all(
      paymentMethods.map(async (method) => {
        const checkbox = await this.page.getByLabel(
          paymentMethodCheckboxLabelMap[method],
        );
        await (enabledMethods.has(method)
          ? expect(checkbox).toBeVisible()
          : expect(checkbox).not.toBeVisible());
      }),
    );
  }

  async fillUserDetails(name: string, email: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
  }

  async chooseMethod(method: PaymentMethod) {
    await expect(this.paymentMethodHeader).toBeVisible();
    const checkbox = await this.page.getByRole("checkbox", {
      name: paymentMethodCheckboxLabelMap[method],
    });
    await checkbox.check();
    await this.confirmButton.click({ force: true });
  }
}
