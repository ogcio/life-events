import PaymentError from "./PaymentError";

function getUrlForPaymentAPI(path: string) {
  return new URL(path, process.env.PAYMENT_HOST_URL);
}

async function findPaymentRequest() {
  const response = await fetch(getUrlForPaymentAPI("/api/findPaymentRequest"));
  const data = await response.json();

  return data.paymentRequestId;
}

export default async (props: { flow: string; userId: string }) => {
  let paymentRequestId: any;
  try {
    paymentRequestId = await findPaymentRequest();
  } catch (err) {
    console.log(err);
  }

  if (!paymentRequestId) {
    return <PaymentError />;
  }

  const paymentsUrl = getUrlForPaymentAPI("/paymentRequest/pay");
  paymentsUrl.searchParams.set("paymentId", paymentRequestId);
  paymentsUrl.searchParams.set("id", `${props.userId}:${props.flow}`);
  paymentsUrl.searchParams.set("embed", "true");

  return (
    <div id="payments-container" style={{ minHeight: "760px" }}>
      <iframe
        style={{ width: "100%", border: "none", height: "760px" }}
        src={paymentsUrl.href}
      ></iframe>
    </div>
  );
};
