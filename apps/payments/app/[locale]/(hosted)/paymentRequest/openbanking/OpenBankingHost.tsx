"use client";
import { Payment } from "truelayer-embedded-payment-page";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ds from "design-system/";

type Props = {
  paymentId: string;
  resourceToken: string;
  returnUri: string;
  maxWaitForResult: string;
};

export default function Page(props: Props) {
  const status = useRef<string>("pending");
  const containerRef = useRef(null);
  const router = useRouter();

  const [payment] = useState(
    Payment({
      payment_id: props.paymentId,
      resource_token: props.resourceToken,
      return_uri: props.returnUri,
      max_wait_for_result: props.maxWaitForResult,
      appearance: {
        default_color: ds.colours.ogcio.primaryButton,
      },
      onDone: () => {
        payment.unmount();
        status.current = "done";
      },
      // remove the target element from the DOM if the user aborts the payment
      onAbort: () => {
        payment.unmount();

        const url = new URL(props.returnUri);
        url.searchParams.append("error", "aborted");
        url.searchParams.append("payment_id", props.paymentId);
        router.push(url.href);
      },
      onError: () => {
        payment.unmount();

        const url = new URL(props.returnUri);
        url.searchParams.append("error", "error");
        url.searchParams.append("payment_id", props.paymentId);
        router.push(url.href);
      },
      onLoad: () => {
        status.current = "loaded";
      },
    }),
  );

  useEffect(() => {
    if (status.current === "pending" && containerRef.current) {
      payment.start({ target: containerRef.current });

      status.current = "loading";
    }
  }, [payment, status, containerRef]);

  return <div style={{ flex: 1, height: "750px" }} ref={containerRef}></div>;
}
