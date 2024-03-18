"use client";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";

type Props = {
  sessionId: string;
};

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY)
  throw Error("Missing env var NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");

const stripePromise = loadStripe(PUBLISHABLE_KEY);

export default function StripeHost({ sessionId }: Props) {
  const [error, setError] = useState("");

  useEffect(() => {
    const redirect = async () => {
      const stripe = await stripePromise;
      if (!stripe) throw Error("Stripe not loaded");
      const result = await stripe.redirectToCheckout({
        sessionId,
      });
      if (result.error) {
        // TODO: redirect
        setError(result.error?.message ?? "An unknown error occurred");
      }
      return result;
    };

    redirect();
  }, []);

  return <div>{error && <div>Error: {error}</div>}</div>;
}
