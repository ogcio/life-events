import EventTable from "./EventTable";
import { web } from "../../../utils";
import StatusMenu from "./StatusMenu";
import { getTranslations } from "next-intl/server";
import UsersWithPartialApplicationsTable from "./UsersWithPartialApplicationsTable";
import { getAuthenticationContext } from "../logto_integration/config";
import { hasPermissions } from "auth/check-permissions";
import hasAdminPermissions from "../utils/hasAdminPermissions";
import { redirect, RedirectType } from "next/navigation";

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
  const context = await getAuthenticationContext();

  const hasPermissions = hasAdminPermissions(
    context.accessToken as string,
    context.scopes,
  );

  if (!hasPermissions) {
    return redirect("/admin/unauthorized", RedirectType.replace);
  }

  const t = await getTranslations("Admin.Submissions");
  const searchParams = new URLSearchParams(props.searchParams);

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
