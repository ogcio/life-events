import { type Page, type Locator } from "@playwright/test";
import { paymentSetupUrl } from "../../utils/constants";
import { PaymentRequestParams } from "./PaymentRequestsPage";
import {
  mockAmount,
  mockDescription,
  mockRedirectUrl,
} from "../../utils/mocks";
import { providerTypeAccountLabelMap } from "../../utils";

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

  constructor(public readonly page: Page) {
    this.titleInput = this.page.getByRole("textbox", { name: /Title/ });
    this.descriptionInput = this.page.getByRole("textbox", {
      name: /Description/,
    });
    this.getAccountSelect = (label: string) => this.page.getByLabel(label);
    this.referenceInput = this.page.getByRole("textbox", { name: /Reference/ });
    this.amountInput = this.page.getByLabel("Amount", { exact: true });
    this.amountOverrideCheckbox = this.page.getByLabel(
      "Allow amount override from URL",
    );
    this.customAmountChweckbox = this.page.getByLabel(
      "Allow the user to pay a custom amount",
    );
    this.redirectURLInput = this.page.locator('input[name="redirect-url"]');
    this.saveButton = this.page.getByRole("button", { name: "Save" });
  }

  async goto() {
    await this.page.goto(`${paymentSetupUrl}/create`);
  }

  async create(params: PaymentRequestParams) {
    await this.titleInput.fill(params.name);
    await this.descriptionInput.fill(mockDescription);
    await Promise.all(
      params.providers.map(async (provider) => {
        await this.getAccountSelect(
          providerTypeAccountLabelMap[provider.type],
        ).selectOption({ label: provider.name });
      }),
    );
    await this.referenceInput.fill("123");
    await this.amountInput.fill(mockAmount);
    if (params.allowAmountOverride) await this.amountOverrideCheckbox.check();
    if (params.allowCustomAmount) await this.customAmountChweckbox.check();
    await this.redirectURLInput.fill(mockRedirectUrl);
    await this.saveButton.click({ force: true });
  }
}
