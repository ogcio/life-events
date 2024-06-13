import { RedirectType, redirect } from "next/navigation";
import { PgSessions } from "auth/sessions";
import EventTable from "./EventTable";
import { web } from "../../../utils";
import StatusMenu from "./StatusMenu";
import { getTranslations } from "next-intl/server";
import UsersWithPartialApplicationsTable from "./UsersWithPartialApplicationsTable";

export type Pages = "pending" | "submitted" | "approved" | "rejected";
export type EventTableSearchParams = {
  [key: string]: string;
  status: Pages;
};

type TableProps = {
  params: {
    event: string;
    action: string[];
    locale: string;
  };
  searchParams?: EventTableSearchParams;
};

const componentsMap: {
  [key in Pages]: (props: TableProps) => Promise<JSX.Element>;
} = {
  pending: UsersWithPartialApplicationsTable,
  submitted: EventTable,
  approved: EventTable,
  rejected: EventTable,
};

export default async (props: web.NextPageProps) => {
  const t = await getTranslations("Admin.Submissions");
  const { publicServant } = await PgSessions.get();

  if (!publicServant) {
    redirect("/", RedirectType.replace);
  }

  const Component = componentsMap[props.searchParams?.status ?? "submitted"];

  const status = props.searchParams?.status as Pages;

  return (
    <>
      <h1 className="govie-heading-l">{t("title")}</h1>
      <StatusMenu searchParams={props.searchParams} />
      <Component params={props.params} searchParams={props.searchParams} />
    </>
  );
};
