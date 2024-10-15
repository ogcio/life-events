import { RedirectType, notFound, redirect } from "next/navigation";
import { routeDefinitions } from "../../../../routeDefinitions";
import { getTranslations } from "next-intl/server";
import { errorHandler, formatCurrency } from "../../../../utils";
import { TransactionStatuses } from "../../../../../types/TransactionStatuses";
import { BankTransferData } from "../../paymentSetup/providers/types";
import { AuthenticationFactory } from "../../../../../libraries/authentication-factory";
import { getAmount } from "../utils";

type Params = {
  searchParams: {
    paymentId: string;
    integrationRef: string;
    submissionId?: string;
    journeyId?: string;
    token?: string;
    customAmount?: string;
  };
};

async function getPaymentDetails({
  id,
  customAmount,
  token,
}: {
  id: string;
  customAmount?: string;
  token?: string;
}) {
  const paymentsApi = await AuthenticationFactory.getPaymentsClient();
  const { data: details, error } =
    await paymentsApi.getPaymentRequestPublicInfo(id);

  if (error) {
    errorHandler(error);
  }

  if (!details || details?.status === "inactive") return undefined;

  const provider = details.providers.find(
    (provider) => provider.type === "banktransfer",
  );

  if (!provider) return undefined;

  const amount = await getAmount({ customAmount, token, prDetails: details });

  return {
    ...details,
    providerId: provider.id,
    providerName: provider.name,
    providerData: provider.data,
    amount,
  };
}

async function confirmPayment(transactionId: string, redirectUrl: string) {
  "use server";

  const paymentsApi = await AuthenticationFactory.getPaymentsClient();
  const { error } = await paymentsApi.updateTransaction(transactionId, {
    status: TransactionStatuses.Pending,
  });

  if (error) {
    errorHandler(error);
  }

  const { data: redirectToken, error: tokenError } =
    await paymentsApi.getRedirectToken(transactionId);

  if (tokenError) {
    errorHandler(tokenError);
  }

  const token = redirectToken?.data.token;
  const url = new URL(redirectUrl);
  if (token) {
    url.searchParams.append("token", token);
  }

  redirect(url.toString(), RedirectType.replace);
}

async function generatePaymentIntentId(): Promise<string> {
  "use server";

  const paymentsApi = await AuthenticationFactory.getPaymentsClient();
  const { data: result, error } = await paymentsApi.generatePaymentIntentId();

  if (error) {
    errorHandler(error);
  }

  if (!result?.data?.intentId) {
    // Handle edge case when intentId was not possible to generate
    console.error("Payment intentId was not possible to generate.");
    return redirect("error", RedirectType.replace);
  }

  return result.data.intentId;
}

export default async function Bank(params: Params) {
  const authContext = AuthenticationFactory.getInstance();
  const { user, isPublicServant } = await authContext.getContext();
  const paymentsApi = await AuthenticationFactory.getPaymentsClient();

  if (isPublicServant) {
    return redirect("/not-found", RedirectType.replace);
  }

  const {
    paymentId,
    integrationRef,
    submissionId = "",
    journeyId = "",
  } = params.searchParams;

  if (!paymentId) {
    redirect(routeDefinitions.paymentRequest.pay.path(), RedirectType.replace);
  }

  const t = await getTranslations("PayManualBankTransfer");

  const paymentDetails = await getPaymentDetails({
    id: params.searchParams.paymentId,
    customAmount: params.searchParams.customAmount,
    token: params.searchParams.token,
  });

  if (!paymentDetails) {
    notFound();
  }

  const paymentIntentId = await generatePaymentIntentId();

  const { data: transaction, error } = await paymentsApi.createTransaction({
    paymentRequestId: paymentId,
    extPaymentId: paymentIntentId,
    integrationReference: integrationRef,
    amount: paymentDetails.amount,
    paymentProviderId: paymentDetails.providerId,
    metadata: {
      email: user?.email ?? "",
      name: user?.name ?? "",
      submissionId,
      journeyId,
    },
  });

  if (error) {
    errorHandler(error);
  }

  const paymentMade = confirmPayment.bind(
    this,
    transaction?.data?.id,
    paymentDetails.redirectUrl,
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "2em",
      }}
    >
      <section style={{ width: "80%" }}>
        <h1 className="govie-heading-l">{t("title")}</h1>

        <dl className="govie-summary-list">
          <div className="govie-summary-list__row">
            <dt className="govie-summary-list__key">{t("summary.title")}</dt>
            <dt className="govie-summary-list__value">
              {paymentDetails.title}
            </dt>
          </div>
          <div className="govie-summary-list__row">
            <dt className="govie-summary-list__key">{t("summary.amount")}</dt>
            <dt className="govie-summary-list__value">
              {formatCurrency(paymentDetails.amount)}
            </dt>
          </div>
          <div className="govie-summary-list__row">
            <dt className="govie-summary-list__key">
              {t("summary.accountHolderName")}
            </dt>
            <dt className="govie-summary-list__value">
              {
                (paymentDetails.providerData as BankTransferData)
                  .accountHolderName
              }
            </dt>
          </div>
          <div className="govie-summary-list__row">
            <dt className="govie-summary-list__key">{t("summary.iban")}</dt>
            <dt className="govie-summary-list__value">
              {(paymentDetails.providerData as BankTransferData).iban}
            </dt>
          </div>
          <div className="govie-summary-list__row">
            <dt className="govie-summary-list__key">
              {t("summary.referenceCode")}*
            </dt>
            <dt className="govie-summary-list__value">
              <b>{paymentIntentId}</b>
              <br />
            </dt>
          </div>
        </dl>
        <p className="govie-body">*{t("summary.referenceCodeDescription")}</p>
        <form action={paymentMade}>
          <button className="govie-button govie-button--primary">
            {t("confirmPayment")}
          </button>
        </form>
      </section>
    </div>
  );
}
