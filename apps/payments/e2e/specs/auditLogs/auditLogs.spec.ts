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
import { AuditLogEventType, ORGANISATIONS } from "../../utils/constants";
import { EditManualBankTransferProviderPage } from "../../objects/providers/EditManualBankTransferProviderPage";

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

    const eventType = AuditLogEventType.PROVIDER_CREATE;
    const auditLogsPage = new AuditLogsListPage(publicServantPage);
    await auditLogsPage.goto();
    await auditLogsPage.checkHeader();
    await auditLogsPage.checkFilters();
    await auditLogsPage.checkAuditLog(bankTransferProvider.id, eventType);
    await auditLogsPage.goToDetails(bankTransferProvider.id, eventType);

    const detailsPage = new AuditLogDetailsPage(publicServantPage);
    await detailsPage.checkEventName(eventType);
    await detailsPage.checkTimestampLabel();
    await detailsPage.checkEventType(eventType);
    await detailsPage.checkUserId();
    await detailsPage.checkOrganizationId(ORGANISATIONS[0].id);
    await detailsPage.checkMetadata(bankTransferProvider.id, "provider");
  });

  test("should create an audit log event when a provider is updated @regression @normal", async ({
    bankTransferProvider,
    publicServantPage,
  }) => {
    await description(
      "This test checks the successful creation of an audit log when a provider is updated.",
    );
    await owner("OGCIO");
    await tags("Audit Logs", "Providers");
    await severity(Severity.NORMAL);

    const editProviderPage = new EditManualBankTransferProviderPage(
      publicServantPage,
    );
    await editProviderPage.checkHeaderVisible();
    await editProviderPage.providerForm.enterName(
      `${bankTransferProvider.name} updated`,
    );
    await editProviderPage.saveChanges();

    const eventType = AuditLogEventType.PROVIDER_UPDATE;
    const auditLogsPage = new AuditLogsListPage(publicServantPage);
    await auditLogsPage.goto();
    await auditLogsPage.checkHeader();
    await auditLogsPage.checkFilters();
    await auditLogsPage.checkAuditLog(bankTransferProvider.id, eventType);
    await auditLogsPage.goToDetails(bankTransferProvider.id, eventType);

    const detailsPage = new AuditLogDetailsPage(publicServantPage);
    await detailsPage.checkEventName(eventType);
    await detailsPage.checkTimestampLabel();
    await detailsPage.checkEventType(eventType);
    await detailsPage.checkUserId();
    await detailsPage.checkOrganizationId(ORGANISATIONS[0].id);
    await detailsPage.checkMetadata(bankTransferProvider.id, "provider");
  });
});
