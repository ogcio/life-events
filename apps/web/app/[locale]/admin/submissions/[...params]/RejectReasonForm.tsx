import { useTranslations } from "next-intl";
import Link from "next/link";
import { redirect } from "next/navigation";
import { postgres } from "../../../../utils";

type Props = {
  flow: string;
  userId: string;
};

export default (props: Props) => {
  const t = useTranslations("Admin.RejectReasonForm");
  async function rejectAction(formData: FormData) {
    "use server";

    const reason = formData.get("rejectReason");
    const userId = formData.get("userId");
    const flow = formData.get("flow");

    reason &&
      (await postgres.pgpool.query(
        `
            UPDATE user_flow_data SET flow_data = flow_data || jsonb_build_object('rejectReason', $1::TEXT, 'rejectedAt', NOW()::TEXT), updated_at = now()
            WHERE user_id=$2 AND flow = $3
        `,
        [reason, userId, flow],
      ));
    redirect("/admin");
  }

  return (
    <form action={rejectAction}>
      <h1 className="govie-heading-s">{t("title")}</h1>
      <div className="govie-form-group">
        <h1 className="govie-label-wrapper">
          <label
            htmlFor="default-textarea"
            className="govie-label--s govie-label--l"
          >
            {t("inputLabel")}
          </label>
        </h1>
        <textarea
          name="rejectReason"
          className="govie-textarea"
          rows={5}
        ></textarea>
        <input type="hidden" name="userId" defaultValue={props.userId} />
        <input type="hidden" name="flow" defaultValue={props.flow} />
      </div>
      <div style={{ display: "flex", gap: "20px" }}>
        <Link
          className="govie-button govie-button--medium govie-button--outlined"
          href={new URL("/admin/submissions", process.env.HOST_URL).href}
        >
          {t("cancel")}
        </Link>
        <button type="submit" className="govie-button govie-button--medium ">
          {t("submit")}
        </button>
      </div>
    </form>
  );
};
