import { redirect } from "next/navigation";
import { pgpool } from "../../../../dbConnection";

const pay = ~~(20 + Math.random() * 80);
export default (props: { flow: string; userId: string }) => {
  async function submitAction() {
    "use server";

    // Let's just assume everything is fantastic
    await pgpool.query(
      `
        UPDATE user_flow_data SET flow_data = flow_data || jsonb_build_object('paymentId', gen_random_uuid()::text, 'totalFeePaid', $1::text, 'dateOfPayment', now()::date::text)
        WHERE user_id=$2 AND flow = $3
    `,
      [pay, props.userId, props.flow]
    );

    redirect("/driving/renew-licence/payment-success");
  }

  return (
    <form action={submitAction}>
      <div className="govie-heading-l">Pay your fee</div>
      <div className="govie-heading-m">Total to pay €{pay}</div>

      <div className="govie-form-group">
        <div className="govie-section-break govie-section-break--visible"></div>
      </div>

      <button type="submit" className="govie-button">
        Pay now
      </button>
    </form>
  );
};
