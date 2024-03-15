import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { StripePaymentElementOptions } from "@stripe/stripe-js";
import { useTranslations } from "next-intl";

type CheckoutFormProps = {
  returnUri: string;
};

const paymentElementOptions: StripePaymentElementOptions = {
  layout: "tabs",
};

export default function CheckoutForm({ returnUri }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const t = useTranslations();

  // TODO: add loading spinner
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUri },
    });

    // immediate errors - the client can try again
    if (error.type === "card_error" || error.type === "validation_error") {
      setErrorMessage(error.message);
    } else {
      setErrorMessage("unexpectedError");
      // TODO: redirect to error page
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" options={paymentElementOptions} />
      <button
        className="govie-button govie-button--primary"
        style={{ marginTop: "1.5rem" }}
        disabled={isLoading || !stripe || !elements}
        id="submit"
      >
        {t("payNow")}
      </button>
      {errorMessage && (
        <div className="govie-warning-text">
          <span className="govie-warning-text__icon" aria-hidden="true">
            !
          </span>
          <strong className="govie-warning-text__text">
            <span className="govie-warning-text__assistive">
              {t("warning")}
            </span>
            {t(errorMessage)}
          </strong>
        </div>
      )}
    </form>
  );
}
