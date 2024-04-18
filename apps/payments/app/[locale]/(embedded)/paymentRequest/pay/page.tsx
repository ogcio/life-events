import { getTranslations } from "next-intl/server";
import { NextIntlClientProvider, AbstractIntlMessages } from "next-intl";

import {
  formatCurrency,
  getRealAmount,
  stringToAmount,
} from "../../../../utils";
import { notFound, redirect } from "next/navigation";
import SelectPaymentMethod from "./SelectPaymentMethod";
import getRequestConfig from "../../../../../i18n";
import buildApiClient from "../../../../../client/index";
import { PgSessions } from "auth/sessions";

type Props = {
  params: {
    locale: string;
  };
  searchParams:
    | {
        paymentId: string;
        id: string;
        amount?: string;
        customAmount?: string;
      }
    | undefined;
};

async function getPaymentRequestDetails(paymentId: string) {
  const { userId } = await PgSessions.get();
  const details = (
    await buildApiClient(userId).paymentRequests.apiV1RequestsRequestIdGet(
      paymentId,
    )
  ).data;

  if (!details) {
    return undefined;
  }

  return details;
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

export default async function Page(props: Props) {
  if (!props.searchParams?.paymentId || !props.searchParams?.id)
    return notFound();

  const [details, t, tCommon] = await Promise.all([
    getPaymentRequestDetails(props.searchParams.paymentId),
    getTranslations("PayPaymentRequest"),
    getTranslations("Common"),
  ]);

  const { messages } = await getRequestConfig({ locale: props.params.locale });

  if (!details) return notFound();

  if (!details.providers.length) {
    return <h1 className="govie-heading-l">{t("errorNotReady")}</h1>;
  }

  const hasOpenBanking = details.providers.some(
    ({ type }) => type === "openbanking",
  );

  const hasManualBanking = details.providers.some(
    ({ type }) => type === "banktransfer",
  );

  const hasStripe = details.providers.some(({ type }) => type === "stripe");

  const allowCustomAmount = details.allowCustomAmount;

  const urlAmount = props.searchParams.amount
    ? parseFloat(props.searchParams.amount)
    : undefined;
  const customAmount = props.searchParams.customAmount
    ? parseFloat(props.searchParams.customAmount)
    : undefined;

  const realAmount = getRealAmount({
    amount: details.amount,
    customAmount,
    amountOverride: urlAmount,
    allowAmountOverride: details.allowAmountOverride,
    allowCustomOverride: details.allowCustomAmount,
  });

  const selectAmountAction = selectCustomAmount.bind(
    this,
    props.searchParams?.paymentId,
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
        }}
      >
        <h1 className="govie-heading-l">{t("title")}</h1>
        <h2 className="govie-heading-m">
          {t("toPay")}: {formatCurrency(realAmount)}
        </h2>
        {allowCustomAmount && (
          <div className="govie-form-group">
            <label htmlFor="customAmount" className="govie-label--s">
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
        <NextIntlClientProvider
          messages={messages?.["PayPaymentRequest"] as AbstractIntlMessages}
        >
          <SelectPaymentMethod
            hasManualBanking={hasManualBanking}
            hasOpenBanking={hasOpenBanking}
            hasStripe={hasStripe}
            paymentId={props.searchParams.paymentId}
            referenceId={props.searchParams.id}
            urlAmount={urlAmount}
            customAmount={customAmount}
          />
        </NextIntlClientProvider>
      </div>
    </div>
  );
}
