import { useTranslations } from "next-intl";
import { redirect } from "next/navigation";
import { web, workflow } from "../../../../utils";

type Props = {
  flow: string;
  data: workflow.GetDigitalWallet;
  onSubmitRedirectSlug: string;
};

export default (props: Props) => {
  const t = useTranslations("ApplicationSuccessful");

  async function returnToPortalAction() {
    "use server";
    redirect(props.onSubmitRedirectSlug);
  }
  return (
    <>
      <div className="govie-grid-column-two-thirds-from-desktop">
        <div className="govie-heading-l">{t("title")}</div>
        <p className="govie-body">{t("getDigitalWalletBody")}</p>
        <div className="govie-heading-m">{t("summaryTitle")}</div>
        <dl className="govie-summary-list">
          <div className="govie-summary-list__row">
            <dt className="govie-summary-list__key">{t("purpose")}</dt>
            <dd className="govie-summary-list__value">{t(props.flow)}</dd>
          </div>
          <div className="govie-summary-list__row">
            <dt className="govie-summary-list__key">{t("date")}</dt>
            <dd className="govie-summary-list__value">
              {web.formatDate(props.data.submittedAt)}
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
