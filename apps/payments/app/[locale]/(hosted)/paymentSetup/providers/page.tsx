import Link from "next/link";
import { useTranslations } from "next-intl";

import ProvidersList from "./ProvidersList";

export default () => {
  const t = useTranslations("PaymentSetup.Providers");

  return (
    <main className="govie-main-wrapper " id="main-content" role="main">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
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
    </main>
  );
};
