import { getTranslations } from "next-intl/server";
import ProviderTypeCard from "./ProviderTypeCard";
import { AuthenticationFactory } from "../../../../../../libraries/authentication-factory";
import { notFound } from "next/navigation";
import PaymentsMenu from "../../PaymentsMenu";

export default async ({ params: { locale } }) => {
  const t = await getTranslations("PaymentSetup.AddProvider");

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
      <div>
        <section
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h1 className="govie-heading-l">{t("title")}</h1>
          <p className="govie-body">{t("description")}</p>
          <legend className="govie-fieldset__legend govie-fieldset__legend--m">
            <h1 className="govie-fieldset__heading">{t("selectHint")}</h1>
          </legend>

          <ProviderTypeCard
            title={t("openbanking")}
            description={t("openbankingDescription")}
            href={"add-openbanking"}
          />
          <ProviderTypeCard
            title={t("banktransfer")}
            description={t("banktransferDescription")}
            href={"add-banktransfer"}
          />
          <ProviderTypeCard
            title={t("stripe")}
            description={t("stripeDescription")}
            href={"add-stripe"}
          />
          {/* TODO: restore worldpay once it's integrated */}
          {/* <ProviderTypeCard
          title={t("worldpay")}
          description={t("worldpayDescription")}
          href={"add-worldpay"}
        /> */}
          <ProviderTypeCard
            title={t("realex")}
            description={t("realexDescription")}
            href={"add-realex"}
          />
        </section>
      </div>
    </div>
  );
};
