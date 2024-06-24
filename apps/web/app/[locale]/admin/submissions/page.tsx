import { RedirectType, redirect } from "next/navigation";
import { PgSessions } from "auth/sessions";
import EventTable from "./EventTable";
import { web } from "../../../utils";
import StatusMenu from "./StatusMenu";
import { getTranslations } from "next-intl/server";
import UsersWithPartialApplicationsTable from "./UsersWithPartialApplicationsTable";

export type Pages = "pending" | "submitted" | "approved" | "rejected";
export type EventTableSearchParams = {
  status: Pages;
  page: string;
  offset: string;
  baseUrl: string;
  limit: string;
};

export type SubmissionsTableProps = Pick<web.NextPageProps, "params"> & {
  searchParams?: EventTableSearchParams;
};

const componentsMap: {
  [key in Pages]: (props: SubmissionsTableProps) => Promise<JSX.Element>;
} = {
  pending: UsersWithPartialApplicationsTable,
  submitted: EventTable,
  approved: EventTable,
  rejected: EventTable,
};

export default async (props: SubmissionsTableProps) => {
  const t = await getTranslations("Admin.Submissions");
  const { publicServant } = await PgSessions.get();
  const searchParams = new URLSearchParams(props.searchParams);

  if (!publicServant) {
    redirect("/", RedirectType.replace);
  }

  const Component = componentsMap[props.searchParams?.status ?? "submitted"];

  return (
    <>
      <h1 className="govie-heading-l">{t("title")}</h1>
      <StatusMenu searchParams={props.searchParams} />
      <Component {...props} />
      <div style={{ textAlign: "right" }}>
        <a
          href={`/admin/submissions/api?${searchParams.toString()}`}
          target="_blank"
          className="govie-link"
        >
          {t("exportCsvFile")}
        </a>
      </div>
    </>
  );
};
