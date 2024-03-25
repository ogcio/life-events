import { getTranslations } from "next-intl/server";

export default async () => {
  const t = await getTranslations("AboutMe");
  return (
    <section style={{ margin: "1rem 0" }}>
      <div className="govie-heading-l">{t("title")}</div>
      <p className="govie-body">{t("comingSoon")}</p>
    </section>
  );
};
