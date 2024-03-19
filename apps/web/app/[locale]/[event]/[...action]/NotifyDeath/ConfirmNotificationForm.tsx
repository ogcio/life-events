import { getTranslations } from "next-intl/server";
import { ListRow } from "../shared/SummaryListRow";
import { postgres, routes, web, workflow } from "../../../../utils";
import { redirect } from "next/navigation";

export default async (props: {
  userId: string;
  flow: string;
  data: workflow.NotifyDeath;
  onSubmitRedirectSlug: string;
}) => {
  const { data, userId, flow, onSubmitRedirectSlug } = props;
  const t = await getTranslations("NotifyDeathConfirmNotificationForm");

  async function submitAction() {
    "use server";

    await postgres.pgpool.query(
      `
          UPDATE user_flow_data SET flow_data = flow_data || jsonb_build_object('confirmedNotification', true), updated_at = now()
          WHERE user_id = $1 AND flow = $2
      `,
      [userId, flow],
    );
    redirect(onSubmitRedirectSlug);
  }

  const changeDetailsHref = routes.death.notifyDeath.details.slug;
  const dateOfDeath =
    data.yearOfDeath && data.monthOfDeath && data.dayOfDeath
      ? web.formatDate(
          `${data.yearOfDeath}-${data.monthOfDeath}-${data.dayOfDeath}`,
        )
      : "";

  return (
    <>
      <div className="govie-grid-row">
        <div className="govie-grid-column-two-thirds-from-desktop">
          <div className="govie-heading-l">{t("title")}</div>
          <dl className="govie-summary-list">
            <ListRow
              change={{ key: t("change"), value: changeDetailsHref }}
              item={{ key: t("referenceNumber"), value: data.referenceNumber }}
            />
            <ListRow
              change={{ key: t("change"), value: changeDetailsHref }}
              item={{ key: t("deceasedSurname"), value: data.deceasedSurname }}
            />
            <ListRow
              change={{ key: t("change"), value: changeDetailsHref }}
              item={{
                key: t("dateOfDeath"),
                value: dateOfDeath,
              }}
            />
          </dl>

          <div className="govie-heading-m">{t("applyingForTitle")}</div>
          <dl className="govie-summary-list">
            <ListRow
              item={{
                key: t("type"),
                value: t(props.flow as Parameters<typeof t>[0]),
              }}
            />
          </dl>

          <details className="govie-details govie-!-font-size-16">
            <summary className="govie-details__summary">
              <span className="govie-details__summary-text">
                {t("detailsSummary")}
              </span>
            </summary>

            <div className="govie-details__text">{t("detailsText")}</div>
          </details>

          <form action={submitAction}>
            <button className="govie-button">{t("confirm")}</button>
          </form>
        </div>
      </div>
    </>
  );
};
