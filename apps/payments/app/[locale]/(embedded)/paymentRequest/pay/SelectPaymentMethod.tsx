"use client";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { providerTypeToPaymentMethod } from "../../../../utils";
import { ProviderWithUnknownData } from "../../../../../types/common";

type Props = {
  providers: ProviderWithUnknownData[];
  paymentId: string;
  referenceId: string;
  runId?: string;
  journeyId?: string;
  isPublicServant: boolean;
  token?: string;
  customAmount?: string;
};

type UrlParams = {
  paymentId: string;
  runId?: string;
  journeyId?: string;
  integrationRef: string;
  token?: string;
  customAmount?: string;
};

async function redirectToPaymentUrl(settings: UrlParams, event) {
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
  runId,
  journeyId,
  type,
  integrationRef,
  token,
  customAmount,
}: UrlParams & { type: string }) {
  const url = new URL(
    `/paymentRequest/${type}`,
    process.env.NEXT_PUBLIC_HOST_URL,
  );
  url.searchParams.set("paymentId", paymentId);
  url.searchParams.set("integrationRef", integrationRef);
  if (runId) url.searchParams.set("runId", runId);
  if (journeyId) url.searchParams.set("journeyId", journeyId);
  if (token) {
    url.searchParams.set("token", token);
  }
  if (customAmount) {
    url.searchParams.set("customAmount", customAmount);
  }
  return url.href;
}

export default function ({
  providers,
  paymentId,
  referenceId,
  runId,
  journeyId,
  isPublicServant,
  token,
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
            disabled={isPublicServant}
            className="govie-radios__input"
          />
          <div className="govie-label--s govie-radios__label">
            <label htmlFor={`${paymentMethod}-${index}`}>
              {t(`payBy.${paymentMethod}.title`)}
            </label>
            <p className="govie-body">
              {t(`payBy.${paymentMethod}.description`)}
            </p>
          </div>
        </div>
      );
    });
  }, [providers, isPublicServant, t]);

  const redirectToPayment = redirectToPaymentUrl.bind(this, {
    paymentId,
    runId,
    journeyId,
    integrationRef: referenceId,
    token,
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
          <button
            className="govie-button govie-button--primary"
            disabled={isPublicServant}
          >
            {t("confirm")}
          </button>
        </div>
      </div>
    </form>
  );
}
