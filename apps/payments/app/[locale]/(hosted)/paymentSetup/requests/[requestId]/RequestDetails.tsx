import React from "react";
import { getTranslations } from "next-intl/server";
import { formatCurrency } from "../../../../../utils";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Tooltip from "../../../../../components/Tooltip";
import CopyLink from "./CopyBtn";
import { PgSessions } from "auth/sessions";
import Modal from "../../../../../components/Modal";
import { Payments } from "building-blocks-sdk";

async function showDeleteModal() {
  "use server";

  redirect("?action=delete");
}

async function closeDeleteModal() {
  "use server";

  redirect("?");
}

async function deletePaymentRequest(requestId: string, userId: string) {
  "use server";

  await new Payments(userId).deletePaymentRequest(requestId);

  redirect("/paymentSetup/requests");
}

async function hasTransactions(requestId: string, userId: string) {
  const transactions = (
    await new Payments(userId).getPaymentRequestTransactions(requestId)
  ).data;
  return transactions && transactions.length > 0;
}

export const RequestDetails = async ({
  requestId,
  action,
  locale,
}: {
  requestId: string;
  action: string | undefined;
  locale: string;
}) => {
  const { userId } = await PgSessions.get();
  const details = (await new Payments(userId).getPaymentRequest(requestId))
    .data;

  const t = await getTranslations("PaymentSetup.CreatePayment");
  const tSetup = await getTranslations("PaymentSetup");
  const tCommon = await getTranslations("Common");

  if (!details) {
    notFound();
  }

  const deletePR = deletePaymentRequest.bind(
    this,
    details.paymentRequestId,
    userId,
  );

  // Cannot delete the payment request if we already have transactions
  const disableDeleteButton = await hasTransactions(requestId, userId);

  const integrationReference = requestId;
  const completePaymentLink = new URL(
    `${locale}/paymentRequest/pay?paymentId=${requestId}&id=${integrationReference}`,
    process.env.HOST_URL ?? "",
  ).toString();

  return (
    <>
      {action === "delete" && (
        <Modal
          title={t("deleteModal.title")}
          body={t("deleteModal.description")}
          confirmActionLabel={t("deleteModal.confirmLabel")}
          confirmAction={deletePR}
          cancelAction={closeDeleteModal}
        ></Modal>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h2 className="govie-heading-m">{tSetup("details")}</h2>
        <div
          style={{
            display: "flex",
            gap: "1rem",
          }}
        >
          <Link href={`/paymentSetup/edit/${requestId}`}>
            <button className="govie-button govie-button--secondary">
              {tCommon("edit")}
            </button>
          </Link>
          {disableDeleteButton ? (
            <Tooltip
              text={tSetup("Request.actions.delete.cannotDelete")}
              width="300px"
            >
              <button className="govie-button govie-button--tertiary" disabled>
                {tCommon("delete")}
              </button>
            </Tooltip>
          ) : (
            <form action={showDeleteModal}>
              <button className="govie-button govie-button--tertiary">
                {tCommon("delete")}
              </button>
            </form>
          )}
        </div>
      </div>

      <dl className="govie-summary-list">
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("form.title")}</dt>
          <dt className="govie-summary-list__value">{details.title}</dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("form.description")}</dt>
          <dt className="govie-summary-list__value">{details.description}</dt>
        </div>

        {details.providers.map(({ name, type, id }) => (
          <div className="govie-summary-list__row" key={id}>
            <dt className="govie-summary-list__key">
              {t(`form.paymentProvider.${type}`)}
            </dt>
            <dt className="govie-summary-list__value">{name}</dt>
          </div>
        ))}

        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("form.amount")}</dt>
          <dt className="govie-summary-list__value">
            {formatCurrency(details.amount)}
          </dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("form.redirectUrl")}</dt>
          <dt className="govie-summary-list__value">{details.redirectUrl}</dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">
            {t("form.allowAmountOverride")}
          </dt>
          <dt className="govie-summary-list__value">
            {JSON.stringify(details.allowAmountOverride)}
          </dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">
            {t("form.allowCustomAmount")}
          </dt>
          <dt className="govie-summary-list__value">
            {JSON.stringify(details.allowCustomAmount)}
          </dt>
        </div>
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("paymentLink")}</dt>
          <dt className="govie-summary-list__value">
            <div style={{ display: "flex", gap: "10px" }}>
              <a
                href={completePaymentLink}
                className="govie-link"
                target="_blank"
              >
                {completePaymentLink}
              </a>
              <CopyLink link={completePaymentLink} buttonText={t("copyLink")} />
            </div>
          </dt>
        </div>
      </dl>
    </>
  );
};
