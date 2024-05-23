import { RedirectType, redirect } from "next/navigation";
import { PgSessions } from "auth/sessions";
import EventTable from "./EventTable";
import { web } from "../../../utils";
import StatusMenu from "./StatusMenu";
import { getTranslations } from "next-intl/server";
import { isFeatureFlagEnabled } from "feature-flags/utils";
import NewEventsTable from "./NewEventsTable";

export default async (props: web.NextPageProps) => {
  const t = await getTranslations("Admin.Submissions");
  const { publicServant } = await PgSessions.get();

  const isDigitalWalletOnboardingEnabled =
    await isFeatureFlagEnabled("digitalWallet");

  if (!publicServant) {
    redirect("/", RedirectType.replace);
  }

  return (
    <>
      <h1 className="govie-heading-l">{t("title")}</h1>
      <StatusMenu searchParams={props.searchParams} />
      {isDigitalWalletOnboardingEnabled ? (
        <NewEventsTable
          params={props.params}
          searchParams={props.searchParams}
        />
      ) : (
        <EventTable params={props.params} searchParams={props.searchParams} />
      )}
    </>
  );
};
