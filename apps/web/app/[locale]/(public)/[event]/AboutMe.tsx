import { getTranslations } from "next-intl/server";
import styles from "./event.module.scss";

export default async () => {
  const t = await getTranslations("AboutMe");
  return (
    <section className={styles.eventContainer}>
      <div className="govie-heading-l">{t("title")}</div>
      <p className="govie-body">{t("comingSoon")}</p>
    </section>
  );
};
