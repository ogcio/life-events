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
    await expect(this.orgSelector).toBeEnabled();
    await expect(this.submitBttn).toBeEnabled();
  }

  async isDisabled() {
    await expect(this.orgSelector).toBeDisabled();
    await expect(this.submitBttn).toBeDisabled();
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
