import Link from "next/link";
import { useTranslations } from "next-intl";

import ProvidersList from "./ProvidersList";

export default () => {
  const t = useTranslations("PaymentSetup.Providers");

  return (
    <div style={{ display: "flex", flexWrap: "wrap", flex: 1 }}>
      <section
        style={{
          margin: "1rem 0",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
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
      </section>
    </div>
  );
};
