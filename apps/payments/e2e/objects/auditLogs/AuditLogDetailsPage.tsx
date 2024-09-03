import { type Page, type Locator, expect } from "@playwright/test";
import {
  AuditLogEventTitles,
  AuditLogEventType,
  AuditLogResourceType,
} from "../../utils/constants";

export class AuditLogDetailsPage {
  private readonly timestampLabel: Locator;
  private readonly userIdLabel: Locator;
  private readonly metadataHeader: Locator;

  constructor(public readonly page: Page) {
    this.timestampLabel = page.getByText("Timestamp");
    this.userIdLabel = page.getByText("User id");
    this.metadataHeader = page.getByRole("heading", { name: "Metadata" });
  }

  async checkEventName(type: AuditLogEventType) {
    const name = AuditLogEventTitles[type];
    await expect(this.page.getByRole("heading", { name })).toBeVisible();
    await expect(
      this.page
        .locator("div")
        .filter({ hasText: "Event name" })
        .last()
        .getByText(name),
    ).toBeVisible();
  }

  async checkTimestampLabel() {
    await expect(this.timestampLabel).toBeVisible();
  }

  async checkEventType(type: AuditLogEventType) {
    await expect(
      this.page
        .locator("div")
        .filter({ hasText: "Event type" })
        .last()
        .getByText(type),
    ).toBeVisible();
  }

  async checkUserIdLabel() {
    await expect(this.userIdLabel).toBeVisible();
  }

  async checkOrganizationId(orgId: string) {
    await expect(
      this.page
        .locator("div")
        .filter({ hasText: "Organization id" })
        .last()
        .getByText(orgId),
    ).toBeVisible();
  }

  async checkMetadata(resourceId: string, resourceType: AuditLogResourceType) {
    await expect(this.metadataHeader).toBeVisible();
    await expect(this.page.getByText(`"resource"`)).toBeVisible();
    await expect(this.page.getByText(`"id"`)).toBeVisible();
    await expect(this.page.getByText(`"${resourceId}`)).toBeVisible();
    await expect(this.page.getByText(`"type"`)).toBeVisible();
    await expect(this.page.getByText(`"${resourceType}`)).toBeVisible();
  }
}
