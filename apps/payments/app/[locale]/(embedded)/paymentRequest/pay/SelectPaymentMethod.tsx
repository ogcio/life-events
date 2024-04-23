"use client";
import { useTranslations } from "next-intl";

async function redirectToPaymentUrl(
  settings: {
    paymentId: string;
    integrationRef: string;
    amount?: number;
    customAmount?: number;
  },
  event,
) {
  event.preventDefault();

  // SelectPaymentMethod is a client component
  // Since this will be embedded in an iframe, we need to redirect the parent window
  // We cannot do it using the Next.js router
  // We need to use window.parent.location.href
  window.parent.location.href = await getPaymentUrl({
    ...settings,
    type: event.target.type.value,
  });
}

async function getPaymentUrl({
  paymentId,
  type,
  integrationRef,
  amount,
  customAmount,
}: {
  paymentId: string;
  type: string;
  integrationRef: string;
  amount?: number;
  customAmount?: number;
}) {
  const url = new URL(
    `/paymentRequest/${type}`,
    process.env.NEXT_PUBLIC_HOST_URL,
  );
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

export default function ({
  hasOpenBanking,
  hasManualBanking,
  hasStripe,
  paymentId,
  referenceId,
  urlAmount,
  customAmount,
}) {
  const t = useTranslations();

  const redirectToPayment = redirectToPaymentUrl.bind(this, {
    paymentId,
    integrationRef: referenceId,
    amount: urlAmount,
    customAmount,
  });

  return (
    <form onSubmit={redirectToPayment} style={{ marginTop: "20px" }}>
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
  );
}
