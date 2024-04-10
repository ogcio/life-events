import { getTranslations } from "next-intl/server";

export default async () => {
  const t = await getTranslations("Consent");
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h2 className="govie-heading-m">{t("preFillFormData")}</h2>
    </div>
  );
};
