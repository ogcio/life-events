import React from "react";
import { getTranslations } from "next-intl/server";
import { formatCurrency } from "../../../../../utils";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Tooltip from "../../../../../components/Tooltip";
import CopyLink from "./CopyBtn";
import buildApiClient from "../../../../../../client/index";
import { PgSessions } from "auth/sessions";

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

  await buildApiClient(userId).paymentRequests.apiV1RequestsRequestIdDelete(
    requestId,
  );

  redirect("/paymentSetup/requests");
}

async function hasTransactions(requestId: string, userId: string) {
  const transactions = (
    await buildApiClient(
      userId,
    ).transactions.apiV1RequestsRequestIdTransactionsGet(requestId)
  ).data;

  return transactions.length > 0;
}

export const RequestDetails = async ({
  requestId,
  action,
}: {
  requestId: string;
  action: string | undefined;
}) => {
  const { userId } = await PgSessions.get();
  let details;

  try {
    details = (
      await buildApiClient(userId).paymentRequests.apiV1RequestsRequestIdGet(
        requestId,
      )
    ).data;
  } catch (err) {
    console.log(err);
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
    userId,
  );

  // Cannot delete the payment request if we already have transactions
  const disableDeleteButton = await hasTransactions(requestId, userId);

  const integrationReference = requestId;
  const completePaymentLink = new URL(
    `/paymentRequest/pay?paymentId=${requestId}&id=${integrationReference}`,
    process.env.HOST_URL ?? "",
  ).toString();

  return (
    <>
      {action === "delete" && (
        <div className="govie-modal">
          <div className="govie-modal--overlay"></div>
          <div
            className="govie-modal--content"
            style={{ position: "absolute" }}
          >
            <form>
              <div className="govie-modal--close-button-container">
                <span data-module="govie-tooltip">
                  <button
                    data-module="govie-icon-button"
                    className="govie-icon-button"
                    formAction={closeDeleteModal}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z"
                        fill="#505A5F"
                      ></path>
                    </svg>
                    <span className="govie-visually-hidden">Close</span>
                  </button>
                  <span className="govie-tooltip govie-tooltip--undefined">
                    Close
                  </span>
                </span>
              </div>
              <h1 className="govie-heading-s">This is a semantic title</h1>
              <p className="govie-body">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </p>
              <p className="govie-body">
                Duis aute irure dolor in reprehenderit in voluptate velit esse
                cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                cupidatat non proident, sunt in culpa qui officia deserunt
                mollit anim id est laborum.
              </p>
              <div className="govie-modal--buttons">
                <button
                  id="cancel button"
                  data-module="govie-button"
                  className="govie-button govie-button--medium govie-button--outlined"
                  formAction={closeDeleteModal}
                >
                  Cancel Action
                </button>
                <button
                  id="confirm button"
                  data-module="govie-button"
                  className="govie-button govie-button--medium "
                  formAction={deletePR}
                >
                  Primary Action
                </button>
              </div>
            </form>
          </div>
        </div>
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
