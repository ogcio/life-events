import { test } from "../../fixtures/transactionsFixtures";
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
import { PaymentRequestDetailsPage } from "../../objects/paymentRequests/PaymentRequestDetailsPage";
import { PaymentRequestFormPage } from "../../objects/paymentRequests/PaymentRequestFormPage";

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
    await detailsPage.checkUserId(publicServantPage);
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
    await detailsPage.checkUserId(publicServantPage);
    await detailsPage.checkOrganizationId(ORGANISATIONS[0].id);
    await detailsPage.checkMetadata(bankTransferProvider.id, "provider");
  });

  test("should create an audit log event when a new payment request is created @regression @normal", async ({
    paymentRequestWithManualBankTransferProvider,
    publicServantPage,
  }) => {
    await description(
      "This test checks the successful creation of an audit log when a new payment request is created.",
    );
    await owner("OGCIO");
    await tags("Audit Logs", "Payment Request");
    await severity(Severity.NORMAL);

    const eventType = AuditLogEventType.PAYMENT_REQUEST_CREATE;
    const auditLogsPage = new AuditLogsListPage(publicServantPage);
    await auditLogsPage.goto();
    await auditLogsPage.checkHeader();
    await auditLogsPage.checkFilters();
    await auditLogsPage.checkAuditLog(
      paymentRequestWithManualBankTransferProvider.id,
      eventType,
    );
    await auditLogsPage.goToDetails(
      paymentRequestWithManualBankTransferProvider.id,
      eventType,
    );

    const detailsPage = new AuditLogDetailsPage(publicServantPage);
    await detailsPage.checkEventName(eventType);
    await detailsPage.checkTimestampLabel();
    await detailsPage.checkEventType(eventType);
    await detailsPage.checkUserId(publicServantPage);
    await detailsPage.checkOrganizationId(ORGANISATIONS[0].id);
    await detailsPage.checkMetadata(
      paymentRequestWithManualBankTransferProvider.id,
      "payment_request",
    );
  });

  test("should create an audit log event when a payment request is updated @regression @normal", async ({
    paymentRequestWithManualBankTransferProvider,
    publicServantPage,
  }) => {
    await description(
      "This test checks the successful creation of an audit log when a payment request is updated.",
    );
    await owner("OGCIO");
    await tags("Audit Logs", "Payment Request");
    await severity(Severity.NORMAL);

    const prDetailsPage = new PaymentRequestDetailsPage(publicServantPage);
    await prDetailsPage.gotoEdit();
    const editPaymentRequestPage = new PaymentRequestFormPage(
      publicServantPage,
    );
    await editPaymentRequestPage.enterAmount("10.00");
    await editPaymentRequestPage.saveChanges();

    const eventType = AuditLogEventType.PAYMENT_REQUEST_UPDATE;
    const auditLogsPage = new AuditLogsListPage(publicServantPage);
    await auditLogsPage.goto();
    await auditLogsPage.checkHeader();
    await auditLogsPage.checkFilters();
    await auditLogsPage.checkAuditLog(
      paymentRequestWithManualBankTransferProvider.id,
      eventType,
    );
    await auditLogsPage.goToDetails(
      paymentRequestWithManualBankTransferProvider.id,
      eventType,
    );

    const detailsPage = new AuditLogDetailsPage(publicServantPage);
    await detailsPage.checkEventName(eventType);
    await detailsPage.checkTimestampLabel();
    await detailsPage.checkEventType(eventType);
    await detailsPage.checkUserId(publicServantPage);
    await detailsPage.checkOrganizationId(ORGANISATIONS[0].id);
    await detailsPage.checkMetadata(
      paymentRequestWithManualBankTransferProvider.id,
      "payment_request",
    );
  });

  test("should create an audit log event when a payment request is deleted @regression @normal", async ({
    paymentRequestWithManualBankTransferProvider,
    publicServantPage,
  }) => {
    await description(
      "This test checks the successful creation of an audit log when a payment request is deleted.",
    );
    await owner("OGCIO");
    await tags("Audit Logs", "Payment Request");
    await severity(Severity.NORMAL);

    const prDetailsPage = new PaymentRequestDetailsPage(publicServantPage);
    await prDetailsPage.delete();
    await prDetailsPage.confirmDelete();

    const eventType = AuditLogEventType.PAYMENT_REQUEST_DELETE;
    const auditLogsPage = new AuditLogsListPage(publicServantPage);
    await auditLogsPage.goto();
    await auditLogsPage.checkHeader();
    await auditLogsPage.checkFilters();
    await auditLogsPage.checkAuditLog(
      paymentRequestWithManualBankTransferProvider.id,
      eventType,
    );
    await auditLogsPage.goToDetails(
      paymentRequestWithManualBankTransferProvider.id,
      eventType,
    );

    const detailsPage = new AuditLogDetailsPage(publicServantPage);
    await detailsPage.checkEventName(eventType);
    await detailsPage.checkTimestampLabel();
    await detailsPage.checkEventType(eventType);
    await detailsPage.checkUserId(publicServantPage);
    await detailsPage.checkOrganizationId(ORGANISATIONS[0].id);
    await detailsPage.checkMetadata(
      paymentRequestWithManualBankTransferProvider.id,
      "payment_request",
    );
  });

  test("should create an audit log event when a transaction is created @regression @normal", async ({
    manualBankTransferTransaction,
    publicServantPage,
    citizenPage,
  }) => {
    await description(
      "This test checks the successful creation of an audit log when a transaction is created.",
    );
    await owner("OGCIO");
    await tags("Audit Logs", "Transaction");
    await severity(Severity.NORMAL);

    const eventType = AuditLogEventType.TRANSACTION_CREATE;
    const auditLogsPage = new AuditLogsListPage(publicServantPage);
    await auditLogsPage.goto();
    await auditLogsPage.checkHeader();
    await auditLogsPage.checkFilters();
    await auditLogsPage.checkAuditLog(
      manualBankTransferTransaction.referenceCode,
      eventType,
    );
    await auditLogsPage.goToDetails(
      manualBankTransferTransaction.referenceCode,
      eventType,
    );

    const detailsPage = new AuditLogDetailsPage(publicServantPage);
    await detailsPage.checkEventName(eventType);
    await detailsPage.checkTimestampLabel();
    await detailsPage.checkEventType(eventType);
    await detailsPage.checkUserId(citizenPage);
    await detailsPage.checkOrganizationId(ORGANISATIONS[0].id);
    await detailsPage.checkMetadata(
      manualBankTransferTransaction.referenceCode,
      "transaction",
    );
  });
});
