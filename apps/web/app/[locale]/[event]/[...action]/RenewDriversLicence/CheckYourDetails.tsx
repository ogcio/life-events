/**
 * This component will probably be a generic one since it's likely to be used in a lot
 * of journeys.
 */
import { useTranslations } from "next-intl";

export const ListRow = ({
  item,
  change,
}: {
  item: { value: string; key: string };
  change?: { value: string; key: string };
}) => (
  <div className="govie-summary-list__row">
    <dt className="govie-summary-list__key">{item.key}</dt>
    <dd className="govie-summary-list__value">{item.value}</dd>
    {change && (
      <dd className="govie-summary-list__actions">
        <a className="govie-link" href={change.value}>
          {change.key}
        </a>
      </dd>
    )}
  </div>
);

type Props = {
  userName: string;
  email: string;
  sex: string;
  mobile: string;
  dateOfBirth: string;
  urlBase: string;
  currentAddress: string;
  timeAtAddress: string;
};
export default (props: Props) => {
  const t = useTranslations("CheckYourDetailsForm");

  const changeDetailsHref = `${props.urlBase}/change-details`;
  const changeAddressHref = `${props.urlBase}/new-address`;
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
              change={{ key: t("change"), value: changeDetailsHref }}
              item={{ key: t("sex"), value: props.sex }}
            />
            <ListRow
              change={{ key: t("change"), value: changeDetailsHref }}
              item={{ key: t("dateOfBirth"), value: props.dateOfBirth }}
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

          <form>
            <button className="govie-button">{t("submitText")}</button>
          </form>
        </div>
      </div>
    </>
  );
};
