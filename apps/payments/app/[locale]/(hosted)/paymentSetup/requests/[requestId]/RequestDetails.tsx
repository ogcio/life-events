import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Payments } from "building-blocks-sdk";
import CopyLink from "./CopyBtn";
import { errorHandler, formatCurrency } from "../../../../../utils";
import Tooltip from "../../../../../components/Tooltip";
import Modal from "../../../../../components/Modal";
import styles from "../PaymentRequests.module.scss";
import { getPaymentsPublicServantContext } from "../../../../../../libraries/auth";

async function showDeleteModal() {
  "use server";

  redirect("?action=delete");
}

async function closeDeleteModal() {
  "use server";

  redirect("?");
}

async function deletePaymentRequest(requestId: string, accessToken: string) {
  "use server";

  const { error } = await new Payments(accessToken).deletePaymentRequest(
    requestId,
  );

  if (error) {
    errorHandler(error);
  }

  redirect("/paymentSetup/requests");
}

async function hasTransactions(requestId: string, accessToken: string) {
  const { data: transactions, error } = await new Payments(
    accessToken,
  ).getPaymentRequestTransactions(requestId, { limit: 5, offset: 0 });

  if (error) {
    errorHandler(error);
  }

  return transactions?.data && transactions.data.length > 0;
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
  const { accessToken } = await getPaymentsPublicServantContext();

  if (!accessToken) {
    return notFound();
  }

  const { data: details, error } = await new Payments(
    accessToken,
  ).getPaymentRequest(requestId);

  if (error) {
    errorHandler(error);
  }

  const t = await getTranslations("PaymentSetup.CreatePayment");
  const tSetup = await getTranslations("PaymentSetup");
  const tCommon = await getTranslations("Common");

  if (!details) {
    notFound();
  }

  const deletePR = deletePaymentRequest.bind(
    this,
    details.paymentRequestId,
    accessToken,
  );

  // Cannot delete the payment request if we already have transactions
  const disableDeleteButton = await hasTransactions(requestId, accessToken);

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

      <div className={styles.headingButtonWrapper}>
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

        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("form.status.title")}</dt>
          <dt className="govie-summary-list__value">{details.status}</dt>
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
