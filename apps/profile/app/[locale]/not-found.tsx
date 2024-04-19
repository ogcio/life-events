import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function NotFound() {
  const t = await getTranslations("NotFound");
  return (
    <div>
      <h2 className="govie-heading-m">{t("title")}</h2>
      <p className="govie-body">{t("description")}</p>
      <Link href="/events">
        <button className="govie-button govie-button--primary">
          {t("return-home")}
        </button>
      </Link>
    </div>
  );
}
