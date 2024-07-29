import Link from "next/link";
import ProvidersList from "./ProvidersList";
import styles from "./Providers.module.scss";
import PaymentsMenu from "../PaymentsMenu";
import { AuthenticationFactory } from "../../../../../libraries/authentication-factory";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

export default async ({ params: { locale } }) => {
  const t = await getTranslations("PaymentSetup.Providers");

  const context = AuthenticationFactory.getInstance();
  const isPublicServant = await context.isPublicServant();
  if (!isPublicServant) return notFound();

  const organizations = Object.values(await context.getOrganizations());
  const defaultOrgId = await context.getSelectedOrganization();

  return (
    <div
      style={{
        display: "flex",
        marginTop: "1.3rem",
        gap: "2rem",
      }}
    >
      <PaymentsMenu
        locale={locale}
        organizations={organizations}
        defaultOrganization={defaultOrgId}
        disableOrgSelector={true}
      />
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
