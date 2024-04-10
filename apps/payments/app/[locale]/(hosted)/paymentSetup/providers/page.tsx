import Link from "next/link";
import { useTranslations } from "next-intl";
import buildApiClient from "../../../../../client/index";
import { PgSessions } from "auth/sessions";
import { EmptyStatus } from "../../../../components/EmptyStatus";
import ProvidersList from "./ProvidersList";

export default async () => {
  const t = useTranslations("PaymentSetup.Providers");
  const { userId } = await PgSessions.get();

  const providers = (await buildApiClient(userId).providers.apiV1ProvidersGet())
    .data;

  if (providers.length === 0) {
    return (
      <EmptyStatus
        title={t("empty.title")}
        description={t("empty.description")}
        action={
          <Link href="providers/add">
            <button
              id="button"
              data-module="govie-button"
              className="govie-button"
            >
              {t("add")}
            </button>
          </Link>
        }
      />
    );
  }

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
        <ProvidersList providers={providers} />
      </section>
    </div>
  );
};
