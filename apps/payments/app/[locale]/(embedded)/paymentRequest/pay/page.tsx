import { getTranslations } from "next-intl/server";
import { NextIntlClientProvider, AbstractIntlMessages } from "next-intl";

import {
  errorHandler,
  formatCurrency,
  getRealAmount,
  stringToAmount,
} from "../../../../utils";
import { notFound, redirect } from "next/navigation";
import SelectPaymentMethod from "./SelectPaymentMethod";
import getRequestConfig from "../../../../../i18n";
import Footer from "../../../(hosted)/Footer";
import { EmptyStatus } from "../../../../components/EmptyStatus";
import Header from "../../../../components/Header/Header";
import Banner from "../../../../components/Banner";
import { AuthenticationFactory } from "../../../../../libraries/authentication-factory";

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

async function getPaymentRequestDetails(paymentId: string) {
  const paymentsApi = await AuthenticationFactory.getPaymentsClient();
  const { data: details, error } =
    await paymentsApi.getPaymentRequestPublicInfo(paymentId);

  if (error) {
    errorHandler(error);
  }

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

  const isPublicServant =
    await AuthenticationFactory.getInstance().isPublicServant();

  const embed = props.searchParams?.embed === "true";

  const [details, t, tBanner, tCommon] = await Promise.all([
    getPaymentRequestDetails(props.searchParams.paymentId),
    getTranslations("PayPaymentRequest"),
    getTranslations("PreviewBanner"),
    getTranslations("Common"),
  ]);

  const { messages } = await getRequestConfig({ locale: props.params.locale });

  if (!details) return notFound();

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
      {details.status === "inactive" ? (
        <EmptyStatus
          title={t("paymentInactive.title")}
          description={t("paymentInactive.description")}
        />
      ) : (
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
              providers={details.providers}
              paymentId={props.searchParams.paymentId}
              referenceId={props.searchParams.id}
              isPublicServant={isPublicServant}
              urlAmount={urlAmount}
              customAmount={customAmount}
            />
          </NextIntlClientProvider>
        </div>
      )}
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
        {isPublicServant && (
          <Banner text={tBanner("bannerText")} tag={tBanner("tag")} />
        )}
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
      <Header locale={props.params.locale} />
      <div
        className="govie-width-container"
        style={{ maxWidth: "1440px", width: "100%" }}
      >
        {isPublicServant && (
          <Banner text={tBanner("bannerText")} tag={tBanner("tag")} />
        )}
        <div style={{ width: "80%", margin: "0 auto", paddingTop: "20px" }}>
          {content}
        </div>
      </div>
      <Footer />
    </body>
  );
}
