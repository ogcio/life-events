import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { postgres, form, routes, workflow } from "../../../../../utils";
import { ListRow } from "../shared/SummaryListRow";

export default async (props: {
  userId: string;
  flow: string;
  data: workflow.ApplyJobseekersAllowance;
  dataValid: boolean;
}) => {
  const { userId, flow, data, dataValid } = props;
  const t = await getTranslations("ApplyJobseekersAllowanceConfirmDetails");

  async function submitAction() {
    "use server";

    await postgres.pgpool.query(
      `
          UPDATE user_flow_data SET flow_data = flow_data || jsonb_build_object('hasConfirmedDetails', true, 'submittedAt', now()), updated_at = now()
          WHERE user_id = $1 AND flow = $2
      `,
      [userId, flow],
    );
    revalidatePath("/");
  }

  const changeDetailsHref =
    routes.employment.applyJobseekersAllowance.changeDetails.slug;
  const changeAddressHref = routes.health.orderEHIC.newAddress.slug;

  return (
    <div className="govie-grid-row">
      <div className="govie-grid-column-two-thirds-from-desktop">
        <h1 className="govie-heading-l">{t("title")}</h1>
        <h2 className="govie-heading-m">{t("subTitle")}</h2>
        <dl className="govie-summary-list">
          <ListRow
            change={{ key: t("change"), value: changeDetailsHref }}
            item={{ key: t("name"), value: data.userName }}
          />
          <ListRow
            change={{ key: t("change"), value: changeAddressHref }}
            item={{ key: t("currentAddress"), value: data.currentAddress }}
          />
          <ListRow
            change={{ key: t("change"), value: changeDetailsHref }}
            item={{ key: t("email"), value: data.email }}
          />
          <ListRow
            change={{ key: t("change"), value: changeDetailsHref }}
            item={{
              key: t("contactNumber"),
              value: data.contactNumber,
            }}
          />
        </dl>
        <form action={submitAction}>
          <button disabled={!dataValid} type="submit" className="govie-button">
            {t("continue")}
          </button>
        </form>
      </div>
    </div>
  );
};
