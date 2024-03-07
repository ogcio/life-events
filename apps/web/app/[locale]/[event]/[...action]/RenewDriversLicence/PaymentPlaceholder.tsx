import { pgpool } from "../../../../dbConnection";
import PaymentError from "./PaymentError";

async function findPaymentRequest() {
  "use server"
  // Helper to find payment request in dev
  // should be removed in production
  const res = await pgpool.query(`
    select payment_request_id
    from payment_requests
    where title ilike '%driving%'
      OR (
        title IS NOT NULL AND NOT EXISTS (select 1 from payment_requests where title ilike '%driving%')
        )
    limit 1
  `)

  if (res.rowCount) {
    return res.rows[0].payment_request_id
  }
}

export default async (props: { flow: string; userId: string }) => {
  const paymentRequestId = await findPaymentRequest()

  if (!paymentRequestId) {
    return <PaymentError />
  }

  const paymentsUrl = new URL('/paymentRequest/pay', process.env.PAYMENT_HOST_URL);
  paymentsUrl.searchParams.set('paymentId', paymentRequestId)
  paymentsUrl.searchParams.set('id', `${props.userId}:${props.flow}`)

  return (
    <div id="payments-container" style={{ minHeight: "760px" }}>
      <iframe style={{ width: '100%', border: 'none', height: '760px'}} src={paymentsUrl.href}></iframe>
    </div>
  );
};
