import { RedirectType, redirect } from "next/navigation";
import { AuthServicePgSessions } from "auth/sessions";
import EventTable from "./EventTable";
import { web } from "../../../utils";
import StatusMenu from "./StatusMenu";
import { getTranslations } from "next-intl/server";

export default async (props: web.NextPageProps) => {
  const t = await getTranslations("Admin.Submissions");
  const { publicServant } = await AuthServicePgSessions.get();

  if (!publicServant) {
    redirect("/", RedirectType.replace);
  }

  return (
    <>
      <h1 className="govie-heading-l">{t("title")}</h1>
      <StatusMenu searchParams={props.searchParams} />
      <EventTable params={props.params} searchParams={props.searchParams} />
    </>
  );
};
