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

export const getRealAmount = ({
  amount,
  customAmount,
  amountOverride,
  allowAmountOverride,
  allowCustomOverride,
}: {
  amount: number;
  customAmount?: number;
  amountOverride?: number;
  allowAmountOverride: boolean;
  allowCustomOverride: boolean;
}) => {
  if (allowAmountOverride && amountOverride) return amountOverride;
  if (allowCustomOverride && customAmount) return customAmount;

  return amount;
};

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
  amount?: number,
  customAmount?: number,
) {
  const url = new URL(`/paymentRequest/${type}`, process.env.HOST_URL);
  url.searchParams.set("paymentId", paymentId);
  url.searchParams.set("integrationRef", integrationRef);
  if (amount) {
    url.searchParams.set("amount", amount.toString());
  }
  if (customAmount) {
    url.searchParams.set("customAmount", customAmount.toString());
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

  const allowCustomAmount = details[0].allowCustomAmount;

  const urlAmount = props.searchParams.amount
    ? parseFloat(props.searchParams.amount)
    : undefined;
  const customAmount = props.searchParams.customAmount
    ? parseFloat(props.searchParams.customAmount)
    : undefined;

  const realAmount = getRealAmount({
    amount: details[0].amount,
    customAmount,
    amountOverride: urlAmount,
    allowAmountOverride: details[0].allowAmountOverride,
    allowCustomOverride: details[0].allowCustomAmount,
  });

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
        {allowCustomAmount && (
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
                      ? customAmount / 100
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
        )}

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
                  customAmount,
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
                  customAmount,
                )}
              />
            </div>
          </>
        )}
        {hasStripe && (
          <div style={{ margin: "1em 0" }}>
            <h3 className="govie-heading-s">{t("payByCard")}</h3>
            <ClientLink
              label={t("payNow")}
              href={getPaymentUrl(
                props.searchParams!.paymentId,
                "stripe",
                props.searchParams!.id,
                urlAmount,
                customAmount,
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}
