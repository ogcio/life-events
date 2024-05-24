import { useTranslations } from "next-intl";
import { revalidatePath } from "next/cache";

import { ListRow } from "../shared/SummaryListRow";
import { workflow, postgres, routes, web } from "../../../../utils";

export default (props: {
  data: workflow.GetDigitalWallet;
  flow: string;
  userId: string;
}) => {
  const { data, flow, userId } = props;
  const t = useTranslations("GetDigitalWallet.DetailsSummary");
  async function submitAction() {
    "use server";

    await postgres.pgpool.query(
      `
        UPDATE user_flow_data SET flow_data = flow_data || jsonb_build_object('confirmedApplication',now()::TEXT, 'submittedAt', now()), updated_at = now()
        WHERE user_id = $1 AND flow = $2
    `,
      [userId, flow],
    );

    revalidatePath("/");
  }

  const changeDetailsHref =
    routes.digitalWallet.getDigitalWallet.changeDetails.slug;

  return (
    <>
      <div className="govie-grid-row">
        <div className="govie-grid-column-two-thirds-from-desktop">
          <div className="govie-heading-l">{t("title")}</div>
          <p className="govie-body">{t("subTitle")}</p>
          <dl className="govie-summary-list">
            <ListRow item={{ key: t("firstName"), value: data.firstName }} />
            <ListRow item={{ key: t("lastName"), value: data.lastName }} />
            <ListRow
              item={{
                key: t("myGovIdEmail"),
                value: data.myGovIdEmail,
              }}
            />
            <ListRow
              change={{ key: t("change"), value: changeDetailsHref }}
              item={{ key: t("govIEEmail"), value: data.govIEEmail }}
            />
            <ListRow
              change={{ key: t("change"), value: changeDetailsHref }}
              item={{
                key: t("jobTitle"),
                value: data.jobTitle,
              }}
            />
            <ListRow
              change={{ key: t("change"), value: changeDetailsHref }}
              item={{
                key: t("selectDeviceText"),
                value: data.deviceType?.toString() as string,
              }}
            />
            <ListRow
              change={{ key: t("change"), value: changeDetailsHref }}
              item={{
                key: t("appStoreEmail"),
                value: data.appStoreEmail,
              }}
            />
          </dl>

          <form action={submitAction}>
            <button className="govie-button">{t("submitText")}</button>
          </form>
        </div>
      </div>
    </>
  );
};
