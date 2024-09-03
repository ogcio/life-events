import { type Page, type Locator, expect } from "@playwright/test";
import { AuditLogEventTitles, AuditLogEventType } from "../../utils/constants";

export class AuditLogsListPage {
  private readonly header: Locator;
  private readonly filtersDescription: Locator;
  private readonly filtersBtn: Locator;

  constructor(public readonly page: Page) {
    this.header = page.getByRole("heading", { name: "Audit Logs" });
    this.filtersDescription = page.getByText("Filter by event type");
    this.filtersBtn = page.getByRole("button", { name: "Filter" });
  }

  async goto() {
    await this.page.goto(`/en/auditLogs`);
  }

  async checkHeader() {
    await expect(this.header).toBeVisible();
  }

  async checkFilters() {
    await expect(this.filtersDescription).toBeVisible();
    await expect(this.filtersBtn).toBeVisible();
    // check select option
  }

  async checkAuditLog(resourceId: string, eventType: AuditLogEventType) {
    const auditLogRow = await this.page.locator(
      `tr[data-resource-id="${resourceId}"]`,
    );
    await expect(
      auditLogRow.getByRole("cell", { name: AuditLogEventTitles[eventType] }),
    ).toBeVisible();
    await expect(
      auditLogRow.getByRole("link", { name: "Details" }),
    ).toBeVisible();
  }

  async filterAuditLog() {}

  async goToDetails(resourceId: string) {
    const auditLogRow = await this.page.locator(
      `tr[data-resource-id="${resourceId}"]`,
    );
    const link = auditLogRow.getByRole("link", { name: "Details" });
    await link.click();
  }
}
