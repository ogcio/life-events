import { expect, Locator, Page } from "@playwright/test";

export class OrganizationSelector {
  private readonly form: Locator;
  private readonly orgSelector: Locator;
  private readonly submitBttn: Locator;

  constructor(public readonly page: Page) {
    this.orgSelector = this.page.getByLabel("Department");
    this.submitBttn = this.page.getByRole("button", {
      name: "Change department",
    });
    this.form = this.page
      .locator("form")
      .filter({ has: this.orgSelector })
      .filter({ has: this.submitBttn });
  }

  async isVisible() {
    await expect(this.form).toBeVisible();
  }

  async isNotVisible() {
    await expect(this.form).not.toBeVisible();
  }

  async isActive() {
    const selectDisabled = await this.orgSelector.isDisabled();
    const buttonDisabled = await this.submitBttn.isDisabled();
    await expect(selectDisabled).toBeFalsy();
    await expect(buttonDisabled).toBeFalsy();
  }

  async isDisabled() {
    const selectDisabled = await this.orgSelector.isDisabled();
    const buttonDisabled = await this.submitBttn.isDisabled();
    await expect(selectDisabled).toBeTruthy();
    await expect(buttonDisabled).toBeTruthy();
  }

  async hasOrganisationSelected(organisationName: string) {
    const selectedOption = await this.orgSelector
      .getByRole("option", { selected: true })
      .textContent();
    await expect(selectedOption).toBe(organisationName);
  }

  async selectOrganization(organizationName: string) {
    await this.orgSelector.selectOption(organizationName);
  }

  async submitSelection() {
    await this.submitBttn.click();
  }
}
