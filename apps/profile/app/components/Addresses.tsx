import { getTranslations } from "next-intl/server";

export default async () => {
  const t = await getTranslations("Addresses");
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 className="govie-heading-m">{t("addresses")}</h2>
        <button
          type="button"
          data-module="govie-button"
          className="govie-button govie-button--secondary"
          style={{ marginBottom: 0 }}
        >
          {t("addAddress")}
        </button>
      </div>
      <p className="govie-body">{t("noAddresses")}</p>
    </>
  );
};
