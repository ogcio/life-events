import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { revalidatePath } from "next/cache";

import { ListRow } from "../shared/SummaryListRow";
import { workflow, postgres, routes } from "../../../../utils";

export default (props: {
  data: workflow.OrderEHIC;
  flow: string;
  userId: string;
  onSubmit?: (formData?: FormData) => Promise<void>;
  dataValid: boolean;
}) => {
  const { data, flow, userId, onSubmit, dataValid } = props;
  const t = useTranslations("DetailsSummaryForm");
  async function submitAction() {
    "use server";

    await postgres.pgpool.query(
      `
        UPDATE user_flow_data SET flow_data = flow_data || jsonb_build_object('confirmedApplication',now()::TEXT, 'submittedAt', now())
        WHERE user_id = $1 AND flow = $2
    `,
      [userId, flow],
    );
    revalidatePath(routes.health.orderEHIC.checkDetails.slug);
  }

  const changeDetailsHref = routes.health.orderEHIC.changeDetails.slug;
  const changeAddressHref = routes.health.orderEHIC.newAddress.slug;
  const dispatchAddressHref = routes.health.orderEHIC.dispatchAddress.slug;
  const selectLocalHealthOfficeHref =
    routes.health.orderEHIC.selectLocalHealthOffice.slug;
  const dateOfBirth =
    data.yearOfBirth && data.monthOfBirth && data.dayOfBirth
      ? dayjs(
          `${data.yearOfBirth}-${data.monthOfBirth}-${data.dayOfBirth}`,
        ).format("DD/MM/YYYY")
      : "";
  return (
    <>
      <div className="govie-grid-row">
        <div className="govie-grid-column-two-thirds-from-desktop">
          <div className="govie-heading-l">{t("check-details")}</div>
          <div className="govie-heading-m">{t("formTitle")}</div>
          <dl className="govie-summary-list">
            <ListRow
              change={{ key: t("change"), value: changeDetailsHref }}
              item={{ key: t("userName"), value: data.userName }}
            />
            <ListRow
              change={{ key: t("change"), value: changeDetailsHref }}
              item={{ key: t("sex"), value: data.sex }}
            />
            <ListRow
              change={{ key: t("change"), value: changeDetailsHref }}
              item={{
                key: t("dateOfBirth"),
                value: dateOfBirth,
              }}
            />
            <ListRow
              change={{ key: t("change"), value: changeDetailsHref }}
              item={{ key: t("PPSN"), value: data.PPSN }}
            />
            <ListRow
              change={{ key: t("change"), value: changeAddressHref }}
              item={{ key: t("homeAddress"), value: data.currentAddress }}
            />
            <ListRow
              change={{ key: t("change"), value: selectLocalHealthOfficeHref }}
              item={{
                key: t("localHealthOffice"),
                value: data.localHealthOffice,
              }}
            />
            <ListRow
              change={{ key: t("change"), value: dispatchAddressHref }}
              item={{ key: t("dispatchAddress"), value: data.dispatchAddress }}
            />
          </dl>

          <p className="govie-body">{t("disclaimerText")}</p>

          <details className="govie-details govie-!-font-size-16">
            <summary className="govie-details__summary">
              <span className="govie-details__summary-text">
                {t("detailsSummary")}
              </span>
            </summary>

            <div className="govie-details__text">{t("detailsText")}</div>
          </details>

          <form action={onSubmit || submitAction}>
            <button disabled={!dataValid} className="govie-button">
              {t("submitText")}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
