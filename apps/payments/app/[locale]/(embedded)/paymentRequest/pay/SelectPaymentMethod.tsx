"use client";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { providerTypeToPaymentMethod } from "../../../../utils";
import { ProviderWithUnknownData } from "../../../../../types/common";

type Props = {
  providers: ProviderWithUnknownData[];
  paymentId: string;
  referenceId: string;
  urlAmount?: number;
  customAmount?: number;
};

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
  providers,
  paymentId,
  referenceId,
  urlAmount,
  customAmount,
}: Props) {
  const t = useTranslations();

  const paymentMethodInputs = useMemo(() => {
    return providers.map(({ type }, index) => {
      const paymentMethod = providerTypeToPaymentMethod[type];
      return (
        <div className="govie-radios__item" key={index}>
          <input
            id={`${paymentMethod}-${index}`}
            name="type"
            type="radio"
            value={type}
            required
            className="govie-radios__input"
          />
          <label
            className="govie-label--s govie-radios__label"
            htmlFor={`${paymentMethod}-${index}`}
          >
            {t(`payBy.${paymentMethod}.title`)}
            <p className="govie-body">
              {t(`payBy.${paymentMethod}.description`)}
            </p>
          </label>
        </div>
      );
    });
  }, [providers]);

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
          {paymentMethodInputs}
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
