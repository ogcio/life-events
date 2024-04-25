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
import { Payments } from "building-blocks-sdk";
import { PgSessions } from "auth/sessions";
import Header from "../../../(hosted)/Header";
import Footer from "../../../(hosted)/Footer";
import { Fragment } from "react";

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
        embed?: string;
      }
    | undefined;
};

async function getPaymentRequestDetails(paymentId: string, userId: string) {
  const details = (
    await new Payments(userId).getPaymentRequestPublicInfo(paymentId)
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

  const { userId } = await PgSessions.get();

  const embed = props.searchParams?.embed === "true";

  const [details, t, tCommon] = await Promise.all([
    getPaymentRequestDetails(props.searchParams.paymentId, userId),
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

  const content = (
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

  if (embed)
    return (
      <body
        style={{
          margin: "unset",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {content}
      </body>
    );

  /**
   * The body tag must be rendered on the page to avoid wrapping the content in other wrappers
   * and to make the content fit the windows' height.
   */
  return (
    <body
      style={{
        margin: "unset",
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />
      {/* All designs are made for 1440 px  */}
      <div
        className="govie-width-container"
        style={{ maxWidth: "1440px", width: "100%" }}
      >
        <div style={{ width: "80%", margin: "0 auto", paddingTop: "20px" }}>
          {content}
        </div>
      </div>
      <Footer />
    </body>
  );
}
