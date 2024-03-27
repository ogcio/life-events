import { type Page, type Locator } from "@playwright/test";
import { paymentRequestUrl, paymentSetupUrl } from "../../utils/constants";
import { PaymentRequestParams } from "./PaymentRequestsPage";
import { mockAmount, mockRedirectUrl } from "../../utils/mocks";
import { ProviderType } from "../../../app/[locale]/(hosted)/paymentSetup/providers/types";

export class PaymentRequestFormPage {
  private readonly titleInput: Locator;
  private readonly descriptionInput: Locator;
  private readonly getAccountSelect: (label: string) => Locator;
  private readonly referenceInput: Locator;
  private readonly amountInput: Locator;
  private readonly redirectURLInput: Locator;
  private readonly amountOverrideCheckbox: Locator;
  private readonly customAmountChweckbox: Locator;
  private readonly saveButton: Locator;

  private readonly providerTypeAccountSelectMap: Record<ProviderType, string> =
    {
      stripe: "Stripe Account",
      banktransfer: "Manual Bank Transfer Account",
      openbanking: "OpenBanking Account",
      worldpay: "Worldpay Account",
    };

  constructor(public readonly page: Page) {
    this.titleInput = this.page.getByRole("textbox", { name: /Title/ });
    this.descriptionInput = this.page.getByRole("textbox", {
      name: /Description/,
    });
    this.getAccountSelect = (label: string) => this.page.getByLabel(label);
    this.referenceInput = this.page.getByRole("textbox", { name: /Reference/ });
    this.amountInput = this.page.getByLabel("Amount", { exact: true });
    this.redirectURLInput = this.page.getByLabel("Redirect URL");
    this.amountOverrideCheckbox = this.page.getByLabel(
      "Allow amount override from URL",
    );
    this.customAmountChweckbox = this.page.getByLabel(
      "Allow the user to pay a custom amount",
    );
    this.saveButton = this.page.getByRole("button", { name: "Save" });
  }

  async goto() {
    await this.page.goto(`${paymentSetupUrl}/create`);
  }

  async create(params: PaymentRequestParams) {
    await this.titleInput.fill(params.name);
    await this.descriptionInput.fill("foo");
    await Promise.all(
      params.providers.map(async (provider) => {
        await this.getAccountSelect(
          this.providerTypeAccountSelectMap[provider.name],
        ).selectOption({ label: provider.type });
      }),
    );
    await this.referenceInput.fill("123");
    await this.amountInput.fill(mockAmount);
    if (params.allowAmountOverride) await this.amountOverrideCheckbox.check();
    if (params.allowCustomAmount) await this.customAmountChweckbox.check();
    await this.redirectURLInput.fill(mockRedirectUrl);
    await this.saveButton.click();

    await this.page.waitForURL(paymentRequestUrl);
  }
}
