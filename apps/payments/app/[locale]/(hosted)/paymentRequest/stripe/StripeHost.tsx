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

type Props = {
  clientSecret?: string;
  returnUri: string;
};

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw Error("Missing env var NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
}

const stripePromise = loadStripe(PUBLISHABLE_KEY);

const appearance: Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: ds.colours.ogcio.darkGrey,
  },
};

export default function StripeHost({ clientSecret, returnUri }: Props) {
  const options: StripeElementsOptions = useMemo(
    () => ({
      clientSecret,
      appearance,
    }),
    [clientSecret],
  );

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
