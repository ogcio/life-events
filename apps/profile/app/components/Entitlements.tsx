import { getTranslations } from "next-intl/server";

export default async () => {
  const t = await getTranslations("Entitlements");
  return (
    <>
      <h2 className="govie-heading-m">{t("entitlements")}</h2>
      <p className="govie-body">{t("noEntitlements")}</p>
    </>
  );
};
