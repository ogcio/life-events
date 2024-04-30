"use client";
import { useTranslations } from "next-intl";
import React, { useEffect, useMemo, useRef } from "react";

type Props = {
  payment: any;
  locale: string;
  responseUrl: string;
};

const PAYMENT_DEFAULT_COUNTRY = "IE";

export default function RealexHost({ payment, locale, responseUrl }: Props) {
  const t = useTranslations();

  const formRef = useRef(null);

  useEffect(() => {
    formRef.current && (formRef.current as HTMLFormElement).submit();
  }, []);

  const formInputs = useMemo(
    () =>
      Object.keys(payment).map((k: any) => (
        <input type="hidden" name={k} value={payment[k]} />
      )),
    [payment],
  );

  return (
    <div>
      <h2>{t("loading")}</h2>
      <form ref={formRef} action={payment.URL} method="POST">
        {formInputs}
        <input type="hidden" name="MERCHANT_RESPONSE_URL" value={responseUrl} />
        <input
          type="hidden"
          name="HPP_CUSTOMER_COUNTRY"
          value={PAYMENT_DEFAULT_COUNTRY}
        />
        <input type="hidden" name="HPP_LANG" value={locale} />
        <input type="hidden" name="HPP_CAPTURE_ADDRESS" value="true" />
        <input type="hidden" name="HPP_REMOVE_SHIPPING" value="true" />
      </form>
    </div>
  );
}
