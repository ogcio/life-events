import { postgres } from "../../../../utils";
import PaymentError from "./PaymentError";

async function findPaymentRequest() {
  const response = await fetch("http://localhost:3001/api/findPaymentRequest");
  const data = await response.json();

  return data.paymentRequestId;
}

export default async (props: { flow: string; userId: string }) => {
  const paymentRequestId = await findPaymentRequest();

  if (!paymentRequestId) {
    return <PaymentError />;
  }

  const paymentsUrl = new URL(
    "/paymentRequest/pay",
    process.env.PAYMENT_HOST_URL,
  );
  paymentsUrl.searchParams.set("paymentId", paymentRequestId);
  paymentsUrl.searchParams.set("id", `${props.userId}:${props.flow}`);

  return (
    <div id="payments-container" style={{ minHeight: "760px" }}>
      <iframe
        style={{ width: "100%", border: "none", height: "760px" }}
        src={paymentsUrl.href}
      ></iframe>
    </div>
  );
};
