import Link from "next/link";
import { useTranslations } from "next-intl";
import ProvidersList from "./ProvidersList";
import styles from "./Providers.module.scss";
import { PageWrapper } from "../../PageWrapper";

export default ({ params: { locale } }) => {
  const t = useTranslations("PaymentSetup.Providers");

  return (
    <PageWrapper locale={locale} disableOrgSelector={true}>
      <div className="table-container">
        <div className={styles.headerWrapper}>
          <h1 className="govie-heading-l">{t("title")}</h1>
          <Link href="providers/add">
            <button
              id="button"
              data-module="govie-button"
              className="govie-button"
            >
              {t("add")}
            </button>
          </Link>
        </div>
        <p className="govie-body">{t("description")}</p>
        <ProvidersList />
      </div>
    </PageWrapper>
  );
};
