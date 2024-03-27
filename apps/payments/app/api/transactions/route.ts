import { pgpool } from "../../dbConnection";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log("hello", req.nextUrl.searchParams);
  const transactionId = req.nextUrl.searchParams
    .get("transactionId")
    ?.toString();
  const userId = req.nextUrl.searchParams.get("userId")?.toString();

  let r = false;

  if (transactionId && userId) {
    console.log("Vi checkar", { userId, transactionId });
    r = await pgpool
      .query<{ paid: boolean }>(
        `
        select exists (
            select 1 from payment_transactions where
            user_id = $1 and payment_request_id = $2
            limit 1
        ) as "paid"
    `,
        [userId, transactionId],
      )
      .then((res) => Boolean(res.rows.at(0)?.paid));
  }

  return NextResponse.json(r);
}

// forces the route handler to be dynamic
export const dynamic = "force-dynamic";
