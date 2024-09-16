import { expect, Locator, Page } from "@playwright/test";
import { TestCases } from "../../../specs/transactions/openBanking.spec";
export class MockBankPortal {
  private readonly portalTitle: Locator;
  private readonly selectAccountTitle: Locator;
  private readonly usernameInput: Locator;
  private readonly continueBtn: Locator;

  constructor(public readonly page: Page) {
    this.portalTitle = this.page.getByText("Online Banking Portal");
    this.selectAccountTitle = this.page.getByText(
      "Select account and confirm payment",
    );
    this.usernameInput = this.page.getByPlaceholder("Enter username");
    this.continueBtn = this.page.getByRole("button", { name: "Continue" });
  }

  async checkPortalTitle() {
    await expect(this.portalTitle).toBeVisible();
  }

  async checkSelectAccountTitle() {
    await expect(this.selectAccountTitle).toBeVisible();
  }

  async enterUserName(testcase: TestCases) {
    await this.usernameInput.fill(testcase);
  }

  async enterPin() {
    await this.page.getByPlaceholder("3rd").fill("1");
    await this.page.getByPlaceholder("4th").fill("1");
    await this.page.getByPlaceholder("6th").fill("1");
  }

  async continue() {
    await this.continueBtn.click();
  }
}
