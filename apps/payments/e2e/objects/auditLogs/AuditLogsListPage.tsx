import { type Page, type Locator, expect } from "@playwright/test";
import { AuditLogEventTitles, AuditLogEventType } from "../../utils/constants";

type FilterParams = {
  user?: string;
  resource?: string;
  action?: string;
};

type EventParams = {
  resourceId: string;
  eventType: AuditLogEventType;
  userId: string;
};
export class AuditLogsListPage {
  private readonly header: Locator;
  private readonly filtersBtn: Locator;
  private readonly userFilterInput: Locator;
  private readonly resourceFilterSelect: Locator;
  private readonly actionFilterSelect: Locator;

  constructor(public readonly page: Page) {
    this.header = page.getByRole("heading", { name: "Audit Logs" });
    this.filtersBtn = page.getByRole("button", { name: "Submit" });
    this.userFilterInput = page.getByLabel("User");
    this.resourceFilterSelect = page.getByLabel("Resource");
    this.actionFilterSelect = page.getByLabel("Action");
  }

  async goto() {
    await this.page.goto(`/en/auditLogs`);
  }

  async checkHeader() {
    await expect(this.header).toBeVisible();
  }

  async checkFilters({
    user = "",
    resource = "",
    action = "",
  }: FilterParams = {}) {
    await expect(this.filtersBtn).toBeVisible();
    await expect(this.userFilterInput).toHaveValue(user);
    await expect(this.resourceFilterSelect).toHaveValue(resource);
    await expect(this.actionFilterSelect).toHaveValue(action);
  }

  async filterByUser(user: string) {
    await this.userFilterInput.fill(user);
    await this.filtersBtn.click();
  }

  async clearFilters() {
    await this.userFilterInput.clear();
    await this.resourceFilterSelect.selectOption("");
    await this.actionFilterSelect.selectOption("");
    await this.filtersBtn.click();
  }

  async checkAuditLog({ resourceId, userId, eventType }: EventParams) {
    await expect(
      this.page
        .locator(`tr[data-resource-id="${resourceId}"]`)
        .filter({
          has: this.page.getByRole("cell", {
            name: AuditLogEventTitles[eventType],
          }),
        })
        .filter({
          has: this.page.getByRole("cell", {
            name: userId,
          }),
        })
        .filter({ has: this.page.getByRole("link", { name: "Details" }) }),
    ).toBeVisible();
  }

  async checkAuditLogNotVisible({
    resourceId,
    userId,
    eventType,
  }: EventParams) {
    await expect(
      this.page
        .locator(`tr[data-resource-id="${resourceId}"]`)
        .filter({
          has: this.page.getByRole("cell", {
            name: AuditLogEventTitles[eventType],
          }),
        })
        .filter({
          has: this.page.getByRole("cell", {
            name: userId,
          }),
        })
        .filter({ has: this.page.getByRole("link", { name: "Details" }) }),
    ).not.toBeVisible();
  }

  async checkMultipleAuditLogs(params: {
    resourceId: string;
    eventType: AuditLogEventType;
    number: number;
  }) {
    await expect(
      await this.page
        .locator(`tr[data-resource-id="${params.resourceId}"]`)
        .filter({
          has: this.page.getByRole("cell", {
            name: AuditLogEventTitles[params.eventType],
          }),
        })
        .filter({ has: this.page.getByRole("link", { name: "Details" }) }),
    ).toHaveCount(params.number);
  }

  async goToDetails({ resourceId, userId, eventType }: EventParams) {
    const auditLogRow = await this.page
      .locator(`tr[data-resource-id="${resourceId}"]`)
      .filter({
        has: this.page.getByRole("cell", {
          name: AuditLogEventTitles[eventType],
        }),
      })
      .filter({
        has: this.page.getByRole("cell", {
          name: userId,
        }),
      });
    const link = auditLogRow.getByRole("link", { name: "Details" });
    await link.click();
  }
}
