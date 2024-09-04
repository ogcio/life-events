import { type Page, type Locator, expect } from "@playwright/test";
import { AuditLogEventTitles, AuditLogEventType } from "../../utils/constants";

export class AuditLogsListPage {
  private readonly header: Locator;
  private readonly filtersBtn: Locator;
  private readonly filtersSelect: Locator;

  constructor(public readonly page: Page) {
    this.header = page.getByRole("heading", { name: "Audit Logs" });
    this.filtersBtn = page.getByRole("button", { name: "Filter" });
    this.filtersSelect = page.getByLabel("Filter by event type");
  }

  async goto() {
    await this.page.goto(`/en/auditLogs`);
  }

  async checkHeader() {
    await expect(this.header).toBeVisible();
  }

  async checkFilters() {
    await expect(this.filtersBtn).toBeVisible();
    await expect(this.filtersSelect).toHaveValue("");
  }

  async checkAuditLog(resourceId: string, eventType: AuditLogEventType) {
    await expect(
      this.page
        .locator(`tr[data-resource-id="${resourceId}"]`)
        .filter({
          has: this.page.getByRole("cell", {
            name: AuditLogEventTitles[eventType],
          }),
        })
        .filter({ has: this.page.getByRole("link", { name: "Details" }) }),
    ).toBeVisible();
  }

  async filterAuditLog() {}

  async goToDetails(resourceId: string, eventType: AuditLogEventType) {
    const auditLogRow = await this.page
      .locator(`tr[data-resource-id="${resourceId}"]`)
      .filter({
        has: this.page.getByRole("cell", {
          name: AuditLogEventTitles[eventType],
        }),
      });
    const link = auditLogRow.getByRole("link", { name: "Details" });
    await link.click();
  }
}
