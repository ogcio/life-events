import { test } from "../../fixtures/providersFixtures";
import {
  Severity,
  owner,
  tags,
  severity,
  description,
} from "allure-js-commons";
import { AuditLogsListPage } from "../../objects/auditLogs/AuditLogsListPage";
import { AuditLogDetailsPage } from "../../objects/auditLogs/AuditLogDetailsPage";
import { AuditLogEventType } from "../../utils/constants";

test.describe("Audit Logs", () => {
  test("should create an audit log event when a new provider is created @regression @normal", async ({
    bankTransferProvider,
    publicServantPage,
  }) => {
    await description(
      "This test checks the successful creation of an audit log when a new provider is created.",
    );
    await owner("OGCIO");
    await tags("Audit Logs", "Providers");
    await severity(Severity.NORMAL);

    const eventName = AuditLogEventType.PROVIDER_CREATE;
    const auditLogsPage = new AuditLogsListPage(publicServantPage);
    await auditLogsPage.goto();
    await auditLogsPage.checkHeader();
    await auditLogsPage.checkAuditLog(bankTransferProvider.id, eventName);
    await auditLogsPage.goToDetails(eventName);

    const detailsPage = new AuditLogDetailsPage(publicServantPage);
    await detailsPage.checkEventName(eventName);
    await detailsPage.checkTimestampLabel();
  });

  //   should create an audit log event when a new provider is updated
  //   should create an audit log event when a new payment request is created
  //   should create an audit log event when a payment request is updated
  //   should create an audit log event when a transaction is created
  //   should create an audit log event when a transaction is updated
  //   should filter audit logs by event type
});
