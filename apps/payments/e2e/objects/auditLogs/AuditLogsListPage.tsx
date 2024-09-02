import { type Page, type Locator, expect } from "@playwright/test";

export class AuditLogsListPage {
  private readonly header: Locator;

  constructor(public readonly page: Page) {
    this.header = page.getByRole("heading", { name: "Audit Logs" });
  }

  async checkHeader() {
    await expect(this.header).toBeVisible();
  }

  async goto() {
    await this.page.goto(`/en/auditLogs`);
  }

  async checkAuditLog(resourceId: string, eventName: string) {
    const auditLogRow = await this.page.locator(
      `tr[data-resource-id="${resourceId}"]`,
    );
    await expect(
      auditLogRow.getByRole("cell", { name: eventName }),
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
