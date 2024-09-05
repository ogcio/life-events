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
import {
  AuditLogEventType,
  myGovIdMockSettings,
  ORGANISATIONS,
  publicServants,
} from "../../utils/constants";
import { EditManualBankTransferProviderPage } from "../../objects/providers/EditManualBankTransferProviderPage";
import { PaymentRequestDetailsPage } from "../../objects/paymentRequests/PaymentRequestDetailsPage";
import { PaymentRequestFormPage } from "../../objects/paymentRequests/PaymentRequestFormPage";
import { TransactionsListPage } from "../../objects/transactions/TransactionsListPage";
import { PublicServantTransactionDetailsPage } from "../../objects/transactions/PublicServantTransactionDetailsPage";
import { getUserId } from "../../utils/logto_utils";

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
    const publicServantUserId = await getUserId(publicServantPage);
    const auditLogsPage = new AuditLogsListPage(publicServantPage);
    await auditLogsPage.goto();
    await auditLogsPage.checkHeader();
    await auditLogsPage.checkFilters();
    const eventParams = {
      resourceId: bankTransferProvider.id,
      eventType,
      userId: publicServantUserId,
    };
    await auditLogsPage.checkAuditLog(eventParams);
    await auditLogsPage.goToDetails(eventParams);

    const detailsPage = new AuditLogDetailsPage(publicServantPage);
    await detailsPage.checkEventName(eventType);
    await detailsPage.checkTimestampLabel();
    await detailsPage.checkEventType(eventType);
    await detailsPage.checkUserId(publicServantUserId);
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
    const publicServantUserId = await getUserId(publicServantPage);
    const auditLogsPage = new AuditLogsListPage(publicServantPage);
    await auditLogsPage.goto();
    await auditLogsPage.checkHeader();
    await auditLogsPage.checkFilters();
    const eventParams = {
      resourceId: bankTransferProvider.id,
      eventType,
      userId: publicServantUserId,
    };
    await auditLogsPage.checkAuditLog(eventParams);
    await auditLogsPage.goToDetails(eventParams);

    const detailsPage = new AuditLogDetailsPage(publicServantPage);
    await detailsPage.checkEventName(eventType);
    await detailsPage.checkTimestampLabel();
    await detailsPage.checkEventType(eventType);
    await detailsPage.checkUserId(publicServantUserId);
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
    const publicServantUserId = await getUserId(publicServantPage);
    const auditLogsPage = new AuditLogsListPage(publicServantPage);
    await auditLogsPage.goto();
    await auditLogsPage.checkHeader();
    await auditLogsPage.checkFilters();
    const eventParams = {
      resourceId: paymentRequestWithManualBankTransferProvider.id,
      eventType,
      userId: publicServantUserId,
    };
    await auditLogsPage.checkAuditLog(eventParams);
    await auditLogsPage.goToDetails(eventParams);

    const detailsPage = new AuditLogDetailsPage(publicServantPage);
    await detailsPage.checkEventName(eventType);
    await detailsPage.checkTimestampLabel();
    await detailsPage.checkEventType(eventType);
    await detailsPage.checkUserId(publicServantUserId);
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
    const publicServantUserId = await getUserId(publicServantPage);
    const auditLogsPage = new AuditLogsListPage(publicServantPage);
    await auditLogsPage.goto();
    await auditLogsPage.checkHeader();
    await auditLogsPage.checkFilters();
    const eventParams = {
      resourceId: paymentRequestWithManualBankTransferProvider.id,
      eventType,
      userId: publicServantUserId,
    };
    await auditLogsPage.checkAuditLog(eventParams);
    await auditLogsPage.goToDetails(eventParams);

    const detailsPage = new AuditLogDetailsPage(publicServantPage);
    await detailsPage.checkEventName(eventType);
    await detailsPage.checkTimestampLabel();
    await detailsPage.checkEventType(eventType);
    await detailsPage.checkUserId(publicServantUserId);
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
    const publicServantUserId = await getUserId(publicServantPage);
    const auditLogsPage = new AuditLogsListPage(publicServantPage);
    await auditLogsPage.goto();
    await auditLogsPage.checkHeader();
    await auditLogsPage.checkFilters();
    const eventParams = {
      resourceId: paymentRequestWithManualBankTransferProvider.id,
      eventType,
      userId: publicServantUserId,
    };
    await auditLogsPage.checkAuditLog(eventParams);
    await auditLogsPage.goToDetails(eventParams);

    const detailsPage = new AuditLogDetailsPage(publicServantPage);
    await detailsPage.checkEventName(eventType);
    await detailsPage.checkTimestampLabel();
    await detailsPage.checkEventType(eventType);
    await detailsPage.checkUserId(publicServantUserId);
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
    const citizenUserId = await getUserId(citizenPage);
    const auditLogsPage = new AuditLogsListPage(publicServantPage);
    await auditLogsPage.goto();
    await auditLogsPage.checkHeader();
    await auditLogsPage.checkFilters();
    const eventParams = {
      resourceId: manualBankTransferTransaction.referenceCode,
      eventType,
      userId: citizenUserId,
    };
    await auditLogsPage.checkAuditLog(eventParams);
    await auditLogsPage.goToDetails(eventParams);

    const detailsPage = new AuditLogDetailsPage(publicServantPage);
    await detailsPage.checkEventName(eventType);
    await detailsPage.checkTimestampLabel();
    await detailsPage.checkEventType(eventType);
    await detailsPage.checkUserId(citizenUserId);
    await detailsPage.checkOrganizationId(ORGANISATIONS[0].id);
    await detailsPage.checkMetadata(
      manualBankTransferTransaction.referenceCode,
      "transaction",
    );
  });

  test("should create an audit log event when a transaction is updated @regression @normal", async ({
    manualBankTransferTransaction,
    publicServantPage,
  }) => {
    await description(
      "This test checks the successful creation of an audit log when a transaction is updated.",
    );
    await owner("OGCIO");
    await tags("Audit Logs", "Transaction");
    await severity(Severity.NORMAL);

    const transactionsListPage = new TransactionsListPage(publicServantPage, {
      isCitizen: false,
    });
    await transactionsListPage.goto();
    await transactionsListPage.gotoDetails(manualBankTransferTransaction);
    const transactionDetailsPage = new PublicServantTransactionDetailsPage(
      publicServantPage,
    );
    await transactionDetailsPage.confirmTransaction();

    const publicServantUserId = await getUserId(publicServantPage);
    const eventType = AuditLogEventType.TRANSACTION_STATUS_UPDATE;
    const auditLogsPage = new AuditLogsListPage(publicServantPage);
    await auditLogsPage.goto();
    await auditLogsPage.checkHeader();
    await auditLogsPage.checkFilters();
    await auditLogsPage.checkMultipleAuditLogs({
      resourceId: manualBankTransferTransaction.referenceCode,
      eventType,
      number: 2,
    });
    await auditLogsPage.goToDetails({
      resourceId: manualBankTransferTransaction.referenceCode,
      eventType,
      userId: publicServantUserId,
    });

    const detailsPage = new AuditLogDetailsPage(publicServantPage);
    await detailsPage.checkEventName(eventType);
    await detailsPage.checkTimestampLabel();
    await detailsPage.checkEventType(eventType);
    await detailsPage.checkUserId(publicServantUserId);
    await detailsPage.checkOrganizationId(ORGANISATIONS[0].id);
    await detailsPage.checkMetadata(
      manualBankTransferTransaction.referenceCode,
      "transaction",
    );
  });

  test("should filter audit logs by user name @regression @normal", async ({
    manualBankTransferTransaction,
    publicServantPage,
    citizenPage,
  }) => {
    await description(
      "This test checks the successful filtering of audit logs by user name.",
    );
    await owner("OGCIO");
    await tags("Audit Logs", "Filter");
    await severity(Severity.NORMAL);

    const transactionsListPage = new TransactionsListPage(publicServantPage, {
      isCitizen: false,
    });
    await transactionsListPage.goto();
    await transactionsListPage.checkHeader();
    await transactionsListPage.checkTransaction(manualBankTransferTransaction);
    await transactionsListPage.gotoDetails(manualBankTransferTransaction);
    const transactionDetailsPage = new PublicServantTransactionDetailsPage(
      publicServantPage,
    );
    await transactionDetailsPage.confirmTransaction();

    const citizenUserId = await getUserId(citizenPage);
    const auditLogsPage = new AuditLogsListPage(publicServantPage);
    await auditLogsPage.goto();
    await auditLogsPage.checkHeader();
    await auditLogsPage.checkFilters();
    await auditLogsPage.checkAuditLog({
      resourceId: manualBankTransferTransaction.referenceCode,
      eventType: AuditLogEventType.TRANSACTION_STATUS_UPDATE,
      userId: citizenUserId,
    });
    await auditLogsPage.filterByUser(publicServants[0]);
    await auditLogsPage.checkAuditLogNotVisible({
      resourceId: manualBankTransferTransaction.referenceCode,
      eventType: AuditLogEventType.TRANSACTION_STATUS_UPDATE,
      userId: citizenUserId,
    });
  });

  test("should filter audit logs by user email @regression @normal", async ({
    manualBankTransferTransaction,
    publicServantPage,
    citizenPage,
  }) => {
    await description(
      "This test checks the successful filtering of audit logs by user email.",
    );
    await owner("OGCIO");
    await tags("Audit Logs", "Filter");
    await severity(Severity.NORMAL);

    const transactionsListPage = new TransactionsListPage(publicServantPage, {
      isCitizen: false,
    });
    await transactionsListPage.goto();
    await transactionsListPage.checkHeader();
    await transactionsListPage.checkTransaction(manualBankTransferTransaction);
    await transactionsListPage.gotoDetails(manualBankTransferTransaction);
    const transactionDetailsPage = new PublicServantTransactionDetailsPage(
      publicServantPage,
    );
    await transactionDetailsPage.confirmTransaction();

    const citizenUserId = await getUserId(citizenPage);
    const auditLogsPage = new AuditLogsListPage(publicServantPage);
    await auditLogsPage.goto();
    await auditLogsPage.checkHeader();
    await auditLogsPage.checkFilters();
    await auditLogsPage.checkAuditLog({
      resourceId: manualBankTransferTransaction.referenceCode,
      eventType: AuditLogEventType.TRANSACTION_STATUS_UPDATE,
      userId: citizenUserId,
    });
    const [name, surname] = publicServants[0].split(" ");
    let emailDomain = myGovIdMockSettings.publicServantEmailDomain;
    const email = `${name.toLocaleLowerCase()}.${surname.toLocaleLowerCase()}@${emailDomain}`;
    await auditLogsPage.filterByUser(email);
    await auditLogsPage.checkAuditLogNotVisible({
      resourceId: manualBankTransferTransaction.referenceCode,
      eventType: AuditLogEventType.TRANSACTION_STATUS_UPDATE,
      userId: citizenUserId,
    });
  });

  test("should filter audit logs by resource @regression @normal", async ({
    bankTransferProvider,
    paymentRequestWithManualBankTransferProvider,
    publicServantPage,
  }) => {
    await description(
      "This test checks the successful filtering of audit logs by resource.",
    );
    await owner("OGCIO");
    await tags("Audit Logs", "Filter");
    await severity(Severity.NORMAL);

    const userId = await getUserId(publicServantPage);
    const auditLogsPage = new AuditLogsListPage(publicServantPage);
    await auditLogsPage.goto();
    await auditLogsPage.checkHeader();
    await auditLogsPage.checkFilters();
    await auditLogsPage.checkAuditLog({
      resourceId: bankTransferProvider.id,
      eventType: AuditLogEventType.PROVIDER_CREATE,
      userId,
    });
    await auditLogsPage.checkAuditLog({
      resourceId: paymentRequestWithManualBankTransferProvider.id,
      eventType: AuditLogEventType.PAYMENT_REQUEST_CREATE,
      userId,
    });
    await auditLogsPage.filterByResource("provider");
    await auditLogsPage.checkAuditLog({
      resourceId: bankTransferProvider.id,
      eventType: AuditLogEventType.PROVIDER_CREATE,
      userId,
    });
    await auditLogsPage.checkAuditLogNotVisible({
      resourceId: paymentRequestWithManualBankTransferProvider.id,
      eventType: AuditLogEventType.PAYMENT_REQUEST_CREATE,
      userId,
    });
  });

  test("should filter audit logs by action @regression @normal", async ({
    bankTransferProvider,
    publicServantPage,
  }) => {
    await description(
      "This test checks the successful filtering of audit logs by action.",
    );
    await owner("OGCIO");
    await tags("Audit Logs", "Filter");
    await severity(Severity.NORMAL);

    const editProviderPage = new EditManualBankTransferProviderPage(
      publicServantPage,
    );
    await editProviderPage.checkHeaderVisible();
    await editProviderPage.providerForm.enterName(
      `${bankTransferProvider.name} updated`,
    );
    await editProviderPage.saveChanges();

    const userId = await getUserId(publicServantPage);
    const auditLogsPage = new AuditLogsListPage(publicServantPage);
    await auditLogsPage.goto();
    await auditLogsPage.checkHeader();
    await auditLogsPage.checkFilters();
    await auditLogsPage.checkAuditLog({
      resourceId: bankTransferProvider.id,
      eventType: AuditLogEventType.PROVIDER_CREATE,
      userId,
    });
    await auditLogsPage.checkAuditLog({
      resourceId: bankTransferProvider.id,
      eventType: AuditLogEventType.PROVIDER_UPDATE,
      userId,
    });
    await auditLogsPage.filterByAction("update");
    await auditLogsPage.checkAuditLog({
      resourceId: bankTransferProvider.id,
      eventType: AuditLogEventType.PROVIDER_UPDATE,
      userId,
    });
    await auditLogsPage.checkAuditLogNotVisible({
      resourceId: bankTransferProvider.id,
      eventType: AuditLogEventType.PROVIDER_CREATE,
      userId,
    });
  });

  test("should filter audit logs by date @regression @normal", async ({
    bankTransferProvider,
    publicServantPage,
  }) => {
    await description(
      "This test checks the successful filtering of audit logs by date.",
    );
    await owner("OGCIO");
    await tags("Audit Logs", "Filter");
    await severity(Severity.NORMAL);

    const userId = await getUserId(publicServantPage);
    const auditLogsPage = new AuditLogsListPage(publicServantPage);
    await auditLogsPage.goto();
    await auditLogsPage.checkHeader();
    await auditLogsPage.checkFilters();
    await auditLogsPage.checkAuditLog({
      resourceId: bankTransferProvider.id,
      eventType: AuditLogEventType.PROVIDER_CREATE,
      userId,
    });

    await auditLogsPage.filterByFromDate("2040-05-01");
    await auditLogsPage.checkAuditLogNotVisible({
      resourceId: bankTransferProvider.id,
      eventType: AuditLogEventType.PROVIDER_CREATE,
      userId,
    });
    await auditLogsPage.clearFilters();
    const today = new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    await auditLogsPage.filterByFromDate(today);
    await auditLogsPage.checkAuditLog({
      resourceId: bankTransferProvider.id,
      eventType: AuditLogEventType.PROVIDER_CREATE,
      userId,
    });
  });

  test("should filter audit logs with a combination of filters @regression @normal", async ({
    bankTransferProvider,
    paymentRequestWithManualBankTransferProvider,
    manualBankTransferTransaction,
    publicServantPage,
    citizenPage,
  }) => {
    await description(
      "This test checks the successful filtering of audit logs with a combination of filters.",
    );
    await owner("OGCIO");
    await tags("Audit Logs", "Filter");
    await severity(Severity.NORMAL);

    const transactionsListPage = new TransactionsListPage(publicServantPage, {
      isCitizen: false,
    });
    await transactionsListPage.goto();
    await transactionsListPage.gotoDetails(manualBankTransferTransaction);
    const transactionDetailsPage = new PublicServantTransactionDetailsPage(
      publicServantPage,
    );
    await transactionDetailsPage.confirmTransaction();

    const publicServantUserId = await getUserId(publicServantPage);
    const citizenUserId = await getUserId(citizenPage);
    const auditLogsPage = new AuditLogsListPage(publicServantPage);
    await auditLogsPage.goto();
    await auditLogsPage.checkHeader();
    await auditLogsPage.checkFilters();
    await auditLogsPage.checkAuditLog({
      resourceId: bankTransferProvider.id,
      eventType: AuditLogEventType.PROVIDER_CREATE,
      userId: publicServantUserId,
    });
    await auditLogsPage.checkAuditLog({
      resourceId: paymentRequestWithManualBankTransferProvider.id,
      eventType: AuditLogEventType.PAYMENT_REQUEST_CREATE,
      userId: publicServantUserId,
    });
    await auditLogsPage.checkAuditLog({
      resourceId: manualBankTransferTransaction.referenceCode,
      eventType: AuditLogEventType.TRANSACTION_CREATE,
      userId: citizenUserId,
    });
    await auditLogsPage.checkAuditLog({
      resourceId: manualBankTransferTransaction.referenceCode,
      eventType: AuditLogEventType.TRANSACTION_STATUS_UPDATE,
      userId: publicServantUserId,
    });
    await auditLogsPage.filterByUser(publicServants[0]);
    await auditLogsPage.filterByResource("transaction");
    await auditLogsPage.checkAuditLogNotVisible({
      resourceId: bankTransferProvider.id,
      eventType: AuditLogEventType.PROVIDER_CREATE,
      userId: publicServantUserId,
    });
    await auditLogsPage.checkAuditLogNotVisible({
      resourceId: paymentRequestWithManualBankTransferProvider.id,
      eventType: AuditLogEventType.PAYMENT_REQUEST_CREATE,
      userId: publicServantUserId,
    });
    await auditLogsPage.checkAuditLogNotVisible({
      resourceId: manualBankTransferTransaction.referenceCode,
      eventType: AuditLogEventType.TRANSACTION_CREATE,
      userId: citizenUserId,
    });
    await auditLogsPage.checkAuditLog({
      resourceId: manualBankTransferTransaction.referenceCode,
      eventType: AuditLogEventType.TRANSACTION_STATUS_UPDATE,
      userId: publicServantUserId,
    });
  });
});
