import Link from "next/link";
import { useTranslations } from "next-intl";
import ProvidersList from "./ProvidersList";
import styles from "./Providers.module.scss";
import PaymentsMenu from "../PaymentsMenu";

export default ({ params: { locale } }) => {
  const t = useTranslations("PaymentSetup.Providers");

  return (
    <div
      style={{
        display: "flex",
        marginTop: "1.3rem",
        gap: "2rem",
      }}
    >
      <PaymentsMenu locale={locale} />
      <div className="table-container">
        <section
          style={{
            margin: "1rem 0",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
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
        </section>
      </div>
    </div>
  );
};
