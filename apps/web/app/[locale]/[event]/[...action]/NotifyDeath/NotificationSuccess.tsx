import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { redirect } from "next/navigation";
import { workflow } from "../../../../utils";

type Props = {
  flow: string;
  data: workflow.NotifyDeath;
  onSubmitRedirectSlug: string;
};

export default (props: Props) => {
  const t = useTranslations("NotificationSuccessForm");

  async function returnToPortalAction() {
    "use server";
    redirect(props.onSubmitRedirectSlug);
  }

  return (
    <>
      <div className="govie-panel govie-panel--confirmation">
        <div className="govie-panel__title">{t("panelTitle")}</div>
        <div className="govie-panel__body">
          {t("panelReferenceText")}
          <br />
          <strong>{t("panelReferenceNumber")}</strong>
        </div>
      </div>
      <div className="govie-grid-column-two-thirds-from-desktop">
        <div className="govie-heading-l">{t("title")}</div>
        <p className="govie-body">{t("notifyDeathBody")}</p>
        <div className="govie-heading-m">{t("summaryTitle")}</div>
        <dl className="govie-summary-list">
          <div className="govie-summary-list__row">
            <dt className="govie-summary-list__key">{t("purpose")}</dt>
            <dd className="govie-summary-list__value">{t(props.flow)}</dd>
          </div>
          <div className="govie-summary-list__row">
            <dt className="govie-summary-list__key">{t("date")}</dt>
            <dd className="govie-summary-list__value">
              {dayjs(props.data.submittedAt).format("DD/MM/YYYY")}
            </dd>
          </div>
        </dl>
        <form action={returnToPortalAction}>
          <button className="govie-button">{t("submitText")}</button>
        </form>
      </div>
    </>
  );
};
