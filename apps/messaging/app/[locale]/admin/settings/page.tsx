import { useTranslations } from "next-intl";
import Link from "next/link";
import FlexMenuWrapper from "../PageWithMenuFlexWrapper";

export default () => {
  const t = useTranslations("settings.Page");
  return (
    <FlexMenuWrapper>
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
    </FlexMenuWrapper>
  );
};
