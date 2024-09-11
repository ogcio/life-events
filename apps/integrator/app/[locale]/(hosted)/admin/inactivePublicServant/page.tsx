import { getTranslations } from "next-intl/server";

export default async () => {
  const t = await getTranslations("InactivePublicServant");

  return (
    <div
      style={{
        width: "80%",
        margin: "0 auto",
        paddingTop: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "50vh",
        }}
      >
        <h2 className="govie-heading-m">{t("title")}</h2>
        <p className="govie-body">{t("description")}</p>
      </div>
    </div>
  );
};
