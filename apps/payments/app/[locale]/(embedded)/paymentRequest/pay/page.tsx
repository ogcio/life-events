import { getTranslations } from "next-intl/server";

import {
  formatCurrency,
  getRealAmount,
  stringToAmount,
} from "../../../../utils";
import { pgpool } from "../../../../dbConnection";
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
      JOIN payment_requests_providers ppr ON pr.payment_request_id = ppr.payment_request_id AND ppr.enabled = true
      join payment_providers pp on ppr.provider_id = pp.provider_id
      where pr.payment_request_id = $1`,
    [paymentId],
  );

  if (!res.rowCount) {
    return undefined;
  }

  return res.rows;
}

async function selectCustomAmount(requestId: string, formData: FormData) {
  "use server";
  const customAmount = stringToAmount(
    formData.get("customAmount")?.toString() as string,
  );
  const integrationReference = requestId;

  redirect(
    `./pay?paymentId=${requestId}&id=${integrationReference}&customAmount=${customAmount}`,
  );
}

async function redirectToPaymentUrl(
  settings: {
    paymentId: string;
    integrationRef: string;
    amount?: number;
    customAmount?: number;
  },
  formData: FormData,
) {
  "use server";
  const type = formData.get("type") as string;
  const { paymentId, integrationRef, amount, customAmount } = settings;
  redirect(
    getPaymentUrl(paymentId, type, integrationRef, amount, customAmount),
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
  );

  const redirectToPayment = redirectToPaymentUrl.bind(this, {
    paymentId: props.searchParams.paymentId,
    integrationRef: props.searchParams.id,
    amount: urlAmount,
    customAmount,
  });

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
              <div style={{ margin: "1em 0px" }}>
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
        <form action={redirectToPayment} style={{ marginTop: "20px" }}>
          <div className="govie-form-group">
            <h2 className="govie-heading-l">{t("choose")}</h2>
            <div
              data-module="govie-radios"
              className="govie-radios govie-radios--large"
            >
              {hasOpenBanking && (
                <div className="govie-radios__item">
                  <input
                    id="bankTransfer-0"
                    name="type"
                    type="radio"
                    value="bankTransfer"
                    className="govie-radios__input"
                  />
                  <label
                    className="govie-label--s govie-radios__label"
                    htmlFor="bankTransfer-0"
                  >
                    {t("payByBank")}
                    <p className="govie-body">{t("payByBankDescription")}</p>
                  </label>
                </div>
              )}

              {hasManualBanking && (
                <div className="govie-radios__item">
                  <input
                    id="manual-0"
                    name="type"
                    type="radio"
                    value="manual"
                    className="govie-radios__input"
                  />

                  <label
                    className="govie-label--s govie-radios__label"
                    htmlFor="manual-0"
                  >
                    {t("manualBankTransfer")}
                    <p className="govie-body">
                      {t("manualBankTransferDescription")}
                    </p>
                  </label>
                </div>
              )}

              {hasStripe && (
                <div className="govie-radios__item">
                  <input
                    id="stripe-0"
                    name="type"
                    type="radio"
                    value="stripe"
                    className="govie-radios__input"
                  />
                  <label
                    className="govie-label--s govie-radios__label"
                    htmlFor="stripe-0"
                  >
                    {t("payByCard")}
                    <p className="govie-body">{t("payByCardDescription")}</p>
                  </label>
                </div>
              )}
            </div>

            <div className="govie-form-group" style={{ marginTop: "20px" }}>
              <button className="govie-button govie-button--primary">
                {t("confirm")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
