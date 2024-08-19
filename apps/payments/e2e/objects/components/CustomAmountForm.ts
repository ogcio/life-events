import { type Page, type Locator, expect } from "@playwright/test";

export class CustomAmountForm {
  private readonly customAmountInput: Locator;
  private readonly changeAmountBtn: Locator;

  constructor(public readonly page: Page) {
    this.customAmountInput = page.getByLabel("Pay a custom amount");
    this.changeAmountBtn = page.getByRole("button", { name: "Change amount" });
  }

  async checkCustomAmountOptionVisible() {
    await expect(this.customAmountInput).toBeVisible();
    await expect(this.changeAmountBtn).toBeVisible();
    await expect(this.changeAmountBtn).toBeEnabled();
  }

  async checkCustomAmountOptionNotVisible() {
    await expect(this.customAmountInput).not.toBeVisible();
    await expect(this.changeAmountBtn).not.toBeVisible();
  }
}
