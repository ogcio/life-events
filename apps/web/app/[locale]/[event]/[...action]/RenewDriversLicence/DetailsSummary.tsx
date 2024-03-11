import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { revalidatePath } from "next/cache";

import { ListRow } from "./SummaryListRow";
import { workflow, postgres } from "../../../../utils";

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
  },
) => {
  const t = useTranslations("DetailsSummaryForm");
  async function submitAction() {
    "use server";

    await postgres.pgpool.query(
      `
        UPDATE user_flow_data SET flow_data = flow_data || jsonb_build_object('confirmedApplication',now()::TEXT)
        WHERE user_id = $1 AND flow = $2
    `,
      [props.userId, props.flow],
    );
    revalidatePath("/confirm-application");
  }

  const changeDetailsHref = "/driving/renew-licence/change-details";
  const changeAddressHref = "/driving/renew-licence/new-address";
  const changeProofOfAddressHref = "/driving/renew-licence/proof-of-address";
  const dateOfBirth =
    props.yearOfBirth && props.monthOfBirth && props.dayOfBirth
      ? dayjs(
          `${props.yearOfBirth}-${props.monthOfBirth}-${props.dayOfBirth}`,
        ).format("DD/MM/YYYY")
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
                value: t(props.flow),
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
                  props.proofOfAddressRequest && t(props.proofOfAddressRequest),
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
            <button className="govie-button">{t("submitText")}</button>
          </form>
        </div>
      </div>
    </>
  );
};
