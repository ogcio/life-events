import { type Page, type Locator, expect } from "@playwright/test";
import { CountrySelection } from "./CountrySelection";
import { BankSelection } from "./BankSelection";
import { ReviewPayment } from "./ReviewPayment";
import { CancelPaymentComponent } from "./CancelPaymentComponent";
import { PayWithPhone } from "./PayWithPhone";
import { PaymentInProgress } from "./PaymentInProgress";
import { MockBankPortal } from "./MockBankPortal";
import { PaymentAuthorizationFailed } from "./PaymentAuthorizationFailed";

export class TrueLayerDialogPage {
  public readonly countrySelection: CountrySelection;
  public readonly bankSelection: BankSelection;
  public readonly reviewPayment: ReviewPayment;
  public readonly cancelPaymentComponent: CancelPaymentComponent;
  public readonly payWithPhone: PayWithPhone;
  public readonly mockBankPortal: MockBankPortal;
  public readonly paymentInProgress: PaymentInProgress;
  public readonly paymentAuthorizationFailed: PaymentAuthorizationFailed;
  private readonly cancelBtn: Locator;
  private readonly loader: Locator;
  private readonly frame: string;

  constructor(public readonly page: Page) {
    this.frame = 'iframe[title="Hosted payment page - EPP"]';
    this.countrySelection = new CountrySelection(page, this.frame);
    this.bankSelection = new BankSelection(page, this.frame);
    this.reviewPayment = new ReviewPayment(page, this.frame);
    this.cancelPaymentComponent = new CancelPaymentComponent(page, this.frame);
    this.payWithPhone = new PayWithPhone(page, this.frame);
    this.mockBankPortal = new MockBankPortal(page);
    this.paymentInProgress = new PaymentInProgress(page);
    this.paymentAuthorizationFailed = new PaymentAuthorizationFailed(page);
    this.cancelBtn = page
      .frameLocator(this.frame)
      .getByRole("button", { name: "Cancel payment" });
    this.loader = page
      .frameLocator(this.frame)
      .getByRole("heading", { name: "Connecting" });
  }

  async pay() {
    await this.countrySelection.chooseIreland();
    await this.bankSelection.chooseMockBank();
    await this.reviewPayment.proceed();
  }

  async checkLoader() {
    await expect(this.loader).toBeVisible();
  }

  async cancelPayment() {
    await this.cancelBtn.click();
  }
}
