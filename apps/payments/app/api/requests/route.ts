import { pgpool } from "../../dbConnection";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    await pgpool
      .query<{ requestId: string; userId: string; title: string; redirectUrl }>(
        `
        select payment_request_id as "requestId", user_id as "userId", title, redirect_url as "redirectUrl"
        from payment_requests
    `,
      )
      .then((res) => res.rows),
  );
}

// forces the route handler to be dynamic
export const dynamic = "force-dynamic";
