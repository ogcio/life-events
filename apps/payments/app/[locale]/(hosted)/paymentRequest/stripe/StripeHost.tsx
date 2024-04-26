"use client";
import React, { useMemo } from "react";
import {
  Appearance,
  StripeElementsOptions,
  loadStripe,
} from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import ds from "design-system/";
import { PaymentRequest } from "../../../../../types/common";
import { StripeData } from "../../paymentSetup/providers/types";

type Props = {
  clientSecret?: string;
  returnUri: string;
  paymentRequest: PaymentRequest;
  providerKeysValid: boolean;
};

const appearance: Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: ds.colours.ogcio.green,
    fontFamily: "Lato, arial, sans-serif",
    colorBackground: ds.colours.ogcio.white,
    colorText: ds.colours.ogcio.black,
    colorDanger: ds.colours.ogcio.darkRed,
    colorWarning: ds.colours.ogcio.darkYellow,
    spacingUnit: "4px",
    borderRadius: "4px",
    fontLineHeight: "1.3",
    iconColor: ds.colours.ogcio.green,
  },
};

export default function StripeHost({
  clientSecret,
  returnUri,
  paymentRequest,
  providerKeysValid,
}: Props) {
  const options: StripeElementsOptions = useMemo(
    () => ({
      clientSecret,
      appearance,
    }),
    [clientSecret],
  );

  const stripePromise = useMemo(async () => {
    let pk;
    if (providerKeysValid) {
      pk = (
        paymentRequest.providers.find((p) => p.type === "stripe")!
          .data as unknown as StripeData
      ).livePublishableKey;
    } else {
      // for now we're using our own key if provider keys are not valid
      const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      if (!PUBLISHABLE_KEY)
        throw Error("Missing env var NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
      pk = PUBLISHABLE_KEY;
    }
    return loadStripe(pk);
  }, [paymentRequest]);

  return (
    <div>
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm returnUri={returnUri} />
        </Elements>
      )}
    </div>
  );
}
