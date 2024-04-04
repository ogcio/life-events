import { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { pgpool } from "../../../utils/postgres";
import { driving } from "../../../utils/routes";
import { api, temporaryMockUtils } from "messages";
import { PgSessions } from "auth/sessions";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const transactionId = searchParams.get("transactionId");
  const id = searchParams.get("id") ?? "";
  const pay = searchParams.get("pay");
  const status = searchParams.get("status");

  const [userId, flow] = id.split(":");

  await pgpool.query(
    `
        UPDATE user_flow_data SET flow_data = flow_data || jsonb_build_object('paymentId', $1::int, 'totalPayment', $2::int, 'status', $3::text, 'dateOfPayment', now()::date::text), updated_at = now()
        WHERE user_id=$4 AND flow = $5
    `,
    [transactionId, pay, status, userId, flow],
  );

  const { email } = await PgSessions.get();
  const paymentTemplateIdPlaceholder =
    await temporaryMockUtils.autoPaymentTemplateId();

  // This is for demonstrational purposes.
  if (paymentTemplateIdPlaceholder) {
    await api.pushMessageByTemplate(
      paymentTemplateIdPlaceholder,
      {
        pay: pay ? (+pay / 100).toString() : "0",
        date: new Date().toDateString(),
        ref: transactionId || "failed",
        reason: "Drivers licence renewal",
      },
      [email],
      "message",
      [],
    );
  }

  const eventSuccessTemplateIdPlaceholder =
    await temporaryMockUtils.autoSuccessfulTemplateId();

  if (eventSuccessTemplateIdPlaceholder) {
    await api.pushMessageByTemplate(
      eventSuccessTemplateIdPlaceholder,
      { event: "Drivers licence renewal", date: new Date().toDateString() },
      [email],
      "message",
      [],
    );
  }

  return redirect(
    `/driving/renew-licence/${
      status === "executed"
        ? driving.renewDriversLicence.paymentSuccess.slug
        : driving.renewDriversLicence.paymentError.slug
    }`,
  );
}
