import { useTranslations } from "next-intl";
import { revalidatePath } from "next/cache";

import { ListRow } from "../shared/SummaryListRow";
import { workflow, postgres, routes, web } from "../../../../../utils";

export default (
  props: Pick<
    workflow.RenewDriversLicence,
    | "currentAddress"
    | "dayOfBirth"
    | "userName"
    | "email"
    | "sex"
    | "mobile"
    | "timeAtAddress"
    | "monthOfBirth"
    | "yearOfBirth"
    | "proofOfAddressRequest"
  > & {
    flow: string;
    userId: string;
    onSubmit?: (formData?: FormData) => Promise<void>;
    dataValid: boolean;
  },
) => {
  const t = useTranslations("DetailsSummaryForm");
  async function submitAction() {
    "use server";

    await postgres.pgpool.query(
      `
        UPDATE user_flow_data SET flow_data = flow_data || jsonb_build_object('confirmedApplication',now()::TEXT), updated_at = now()
        WHERE user_id = $1 AND flow = $2
    `,
      [props.userId, props.flow],
    );

    revalidatePath("/confirm-application");
  }

  const changeDetailsHref =
    routes.driving.renewDriversLicence.changeDetails.slug;
  const changeAddressHref = routes.driving.renewDriversLicence.newAddress.slug;
  const changeProofOfAddressHref =
    routes.driving.renewDriversLicence.proofOfAddress.slug;
  const dateOfBirth =
    props.yearOfBirth && props.monthOfBirth && props.dayOfBirth
      ? web.formatDate(
          `${props.yearOfBirth}-${props.monthOfBirth}-${props.dayOfBirth}`,
        )
      : "";
  return (
    <>
      <div className="govie-grid-row">
        <div className="govie-grid-column-two-thirds-from-desktop">
          <div className="govie-heading-l">{t("title")}</div>
          <div className="govie-heading-m">{t("formTitle")}</div>
          <dl className="govie-summary-list">
            <ListRow
              change={{ key: t("change"), value: changeDetailsHref }}
              item={{ key: t("userName"), value: props.userName }}
            />
            <ListRow
              change={{ key: t("change"), value: changeAddressHref }}
              item={{ key: t("currentAddress"), value: props.currentAddress }}
            />
            <ListRow
              change={{ key: t("change"), value: changeAddressHref }}
              item={{
                key: t("timeAtCurrentAddress"),
                value: props.timeAtAddress,
              }}
            />
            <ListRow
              change={{ key: t("change"), value: changeDetailsHref }}
              item={{
                key: t("emailAddress"),
                value: props.email,
              }}
            />
            <ListRow
              change={{ key: t("change"), value: changeDetailsHref }}
              item={{
                key: t("mobileNumber"),
                value: props.mobile,
              }}
            />

            <ListRow
              change={{ key: t("change"), value: changeDetailsHref }}
              item={{ key: t("sex"), value: props.sex }}
            />
            <ListRow
              change={{ key: t("change"), value: changeDetailsHref }}
              item={{
                key: t("dateOfBirth"),
                value: dateOfBirth,
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
            <ListRow
              change={
                props.currentAddress
                  ? { key: t("change"), value: changeProofOfAddressHref }
                  : undefined
              }
              item={{
                key: t("proofOfAddress"),
                value:
                  props.proofOfAddressRequest &&
                  t(props.proofOfAddressRequest as Parameters<typeof t>[0]),
              }}
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

          <form action={props.onSubmit || submitAction}>
            <button disabled={!props.dataValid} className="govie-button">
              {t("submitText")}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
