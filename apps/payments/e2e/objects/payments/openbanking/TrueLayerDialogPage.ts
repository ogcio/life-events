import { type Page, type Locator } from "@playwright/test";
import { CountrySelection } from "./CountrySelection";
import { BankSelection } from "./BankSelection";
import { ReviewPayment } from "./ReviewPayment";

export class TrueLayerDialogPage {
  public readonly countrySelection: CountrySelection;
  public readonly bankSelection: BankSelection;
  public readonly reviewPayment: ReviewPayment;
  private readonly cancelBtn: Locator;
  private readonly loader: Locator;
  private readonly frame: string;

  constructor(public readonly page: Page) {
    this.frame = 'iframe[title="Hosted payment page - EPP"]';
    this.countrySelection = new CountrySelection(page, this.frame);
    this.bankSelection = new BankSelection(page, this.frame);
    this.reviewPayment = new ReviewPayment(page, this.frame);
    this.cancelBtn = page
      .frameLocator(this.frame)
      .getByRole("button", { name: "Cancel payment" });
    this.loader = page
      .frameLocator(this.frame)
      .getByRole("heading", { name: "Connecting..." });
  }

  async pay() {
    await this.countrySelection.chooseIreland();
    await this.bankSelection.chooseMockBank();
    await this.reviewPayment.proceed();
  }

  async checkLoader() {}

  async cancelPayment() {
    await this.cancelBtn.click();
  }
}
