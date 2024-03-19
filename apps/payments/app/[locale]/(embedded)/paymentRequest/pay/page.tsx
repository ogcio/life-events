import { getTranslations } from "next-intl/server";

import { formatCurrency } from "../../../../utils";
import { pgpool } from "../../../../dbConnection";
import { PgSessions } from "auth/sessions";
import ClientLink from "./ClientLink";

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

// Need a common place for these types
type PaymentRequestDO = {
  payment_request_id: string;
  user_id: string;
  title: string;
  description: string;
  provider_id: string;
  reference: string;
  amount: number;
  status: string;
  redirect_url: string;
  allowAmountOverride: boolean;
  allowCustomAmount: boolean;
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

function getPaymentUrl(
  paymentId: string,
  type: string,
  integrationRef: string,
  amount?: string,
) {
  const url = new URL(`/paymentRequest/${type}`, process.env.HOST_URL);
  url.searchParams.set("paymentId", paymentId);
  url.searchParams.set("integrationRef", integrationRef);
  if (amount) {
    url.searchParams.set("amount", amount);
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
  await PgSessions.get();

  const [details, t] = await Promise.all([
    getPaymentRequestDetails(props.searchParams.paymentId),
    getTranslations("PayPaymentRequest"),
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
