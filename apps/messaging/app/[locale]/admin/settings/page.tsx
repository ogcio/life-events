import { useTranslations } from "next-intl";
import Link from "next/link";

export default () => {
  const t = useTranslations("settings.Page");
  return (
    <>
      <div>
        <Link className="govie-link" href="settings/emails">
          {t("emailsLink")}
        </Link>
        <br />
        <Link className="govie-link" href="settings/sms">
          {t("smsLink")}
        </Link>
      </div>
      <Link className="govie-back-link" href="/">
        {t("backLink")}
      </Link>
    </>
  );
};
