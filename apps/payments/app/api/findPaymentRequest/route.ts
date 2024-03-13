import { pgpool } from "../../dbConnection";
import { NextResponse } from "next/server";

export async function GET(req, res) {
  // Helper to find payment request in dev
  // should be removed in production

  //Doing this in the Payments APIs since we need access to the Payments DB
  const response = await pgpool.query(`
        select payment_request_id
        from payment_requests
        where title ilike '%driving%'
          OR (
            title IS NOT NULL AND NOT EXISTS (select 1 from payment_requests where title ilike '%driving%')
            )
        limit 1
      `);

  return NextResponse.json({
    paymentRequestId: response.rows[0].payment_request_id,
  });
}
