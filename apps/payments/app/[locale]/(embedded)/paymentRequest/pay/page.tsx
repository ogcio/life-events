import { getTranslations } from "next-intl/server";

import { formatCurrency } from "../../../../utils";
import { pgpool } from "../../../../dbConnection";
import { PgSessions } from "auth/sessions";
import ClientLink from "./ClientLink";
import { PaymentRequestDO } from "../../../../../types/common";
import { redirect } from "next/navigation";

type Props = {
  searchParams:
    | {
        paymentId: string;
        id: string;
        amount?: string;
        customAmount?: string;
      }
    | undefined;
};

type PaymentRequestDetails = Pick<
  PaymentRequestDO,
  | "title"
  | "description"
  | "amount"
  | "allowAmountOverride"
  | "allowCustomAmount"
> & { provider_name: string; provider_type: string };

async function getPaymentRequestDetails(paymentId: string) {
  "use server";

  const res = await pgpool.query<PaymentRequestDetails>(
    `select pr.title, pr.description, pr.amount, pp.provider_name, pp.provider_type, 
      pr.allow_amount_override as "allowAmountOverride", pr.allow_custom_amount as "allowCustomAmount"
      from payment_requests pr
      join payment_requests_providers ppr on pr.payment_request_id = ppr.payment_request_id
      join payment_providers pp on ppr.provider_id = pp.provider_id
      where pr.payment_request_id = $1`,
    [paymentId],
  );

  if (!res.rowCount) {
    return undefined;
  }

  return res.rows;
}

async function selectCustomAmount(
  requestId: string,
  userId: string,
  formData: FormData,
) {
  "use server";
  const amountAsString = formData.get("customAmount")?.toString() ?? "";
  const customAmount = Math.round(parseFloat(amountAsString) * 100);

  const integrationReference = `${userId}:${requestId}`;

  redirect(
    `./pay?paymentId=${requestId}&id=${integrationReference}&customAmount=${customAmount}`,
  );
}

function getPaymentUrl(
  paymentId: string,
  type: string,
  integrationRef: string,
  amount?: string,
  customAmount?: string,
) {
  const url = new URL(`/paymentRequest/${type}`, process.env.HOST_URL);
  url.searchParams.set("paymentId", paymentId);
  url.searchParams.set("integrationRef", integrationRef);
  if (amount) {
    url.searchParams.set("amount", amount);
  }
  if (customAmount) {
    url.searchParams.set("customAmount", customAmount);
  }
  return url.href;
}
const NotFound = async () => {
  const t = await getTranslations("Common");
  return <h1 className="govie-heading-l">{t("notFound")}</h1>;
};

export default async function Page(props: Props) {
  if (!props.searchParams?.paymentId || !props.searchParams?.id)
    return <NotFound />;

  // Enforce being logged in
  const { userId } = await PgSessions.get();

  const [details, t, tCommon] = await Promise.all([
    getPaymentRequestDetails(props.searchParams.paymentId),
    getTranslations("PayPaymentRequest"),
    getTranslations("Common"),
  ]);

  if (!details) return <NotFound />;

  const hasOpenBanking = details.some(
    ({ provider_type }) => provider_type === "openbanking",
  );

  const hasManualBanking = details.some(
    ({ provider_type }) => provider_type === "banktransfer",
  );

  const hasStripe = details.some(
    ({ provider_type }) => provider_type === "stripe",
  );

  const baseAmount = details[0].amount;
  const canOverrideAmount = details[0].allowAmountOverride;
  const allowCustomAmount = details[0].allowCustomAmount;

  const urlAmount = props.searchParams.amount;
  const customAmount = props.searchParams.customAmount;
  let realAmount = baseAmount;
  if (urlAmount && canOverrideAmount) {
    realAmount = parseFloat(urlAmount);
  }
  // We need to choose the priority of the rules
  if (customAmount && allowCustomAmount) {
    realAmount = parseFloat(customAmount);
  }

  const selectAmountAction = selectCustomAmount.bind(
    this,
    props.searchParams?.paymentId,
    userId,
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        marginTop: "1.3rem",
        gap: "2rem",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "80%",
          gap: "2em",
        }}
      >
        <h1 className="govie-heading-l">{t("title")}</h1>
        <h2 className="govie-heading-m">
          {t("toPay")}: {formatCurrency(realAmount)}
        </h2>
        <div className="govie-form-group">
          <label htmlFor="amount" className="govie-label--s">
            {t("selectCustomAmount")}
          </label>

          <form style={{ maxWidth: "500px" }} action={selectAmountAction}>
            <div className="govie-input__wrapper">
              <div aria-hidden="true" className="govie-input__prefix">
                {tCommon("currencySymbol")}
              </div>
              <input
                type="number"
                id="customAmount"
                name="customAmount"
                className="govie-input"
                min="0.00"
                max="10000.00"
                step="0.01"
                required
                defaultValue={
                  customAmount && allowCustomAmount
                    ? parseFloat(customAmount) / 100
                    : undefined
                }
              />
            </div>
            <input
              type="submit"
              value={t("changeAmount")}
              className="govie-button"
            />
          </form>
        </div>
        <hr className="govie-section-break govie-section-break--visible"></hr>
        {hasOpenBanking && (
          <>
            <div style={{ margin: "1em 0" }}>
              <div style={{ display: "flex", gap: "1em", marginBottom: "1em" }}>
                <h3 className="govie-heading-s" style={{ margin: 0 }}>
                  {t("payByBank")}
                </h3>
                <strong className="govie-tag govie-tag--green">
                  Recommended
                </strong>
              </div>
              <p className="govie-body">{t("payByBankDescription")}</p>
              <ClientLink
                label={t("payNow")}
                href={getPaymentUrl(
                  props.searchParams.paymentId,
                  "bankTransfer",
                  props.searchParams.id,
                  urlAmount,
                )}
              />
            </div>
            <hr className="govie-section-break govie-section-break--visible"></hr>
          </>
        )}
        {hasManualBanking && (
          <>
            <div style={{ margin: "1em 0" }}>
              <div style={{ display: "flex", gap: "1em", marginBottom: "1em" }}>
                <h3 className="govie-heading-s" style={{ margin: 0 }}>
                  {t("manualBankTransfer")}
                </h3>
              </div>
              <p className="govie-body">{t("manualBankTransferDescription")}</p>
              <ClientLink
                label={t("payNow")}
                href={getPaymentUrl(
                  props.searchParams.paymentId,
                  "manual",
                  props.searchParams.id,
                  urlAmount,
                )}
              />
            </div>
            <hr className="govie-section-break govie-section-break--visible"></hr>
          </>
        )}
        <div style={{ margin: "1em 0" }}>
          <h3 className="govie-heading-s">{t("payByCard")}</h3>
          {hasStripe && (
            <ClientLink
              label={t("payNow")}
              href={getPaymentUrl(
                props.searchParams!.paymentId,
                "stripe",
                props.searchParams!.id,
                urlAmount,
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
}
