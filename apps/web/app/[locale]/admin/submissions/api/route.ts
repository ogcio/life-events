import { writeToBuffer } from "fast-csv";
import { getPartialApplications } from "../UsersWithPartialApplicationsTable";
import { getQueryParams } from "../components/paginationUtils";
import { web } from "../../../../utils";
import { PgSessions } from "auth/sessions";
import { getSubmissions } from "../EventTable";
import { Pages } from "../page";

export const GET = async (request: Request) => {
  await PgSessions.get();
  const { searchParams } = new URL(request.url);

  const queryParams = getQueryParams(searchParams);

  const status = searchParams.get("status");
  let data: {
    username?: string;
    myGovIdEmail: string;
    firstName?: string;
    lastName?: string;
    workEmail?: string;
    applicationStatus?: string;
    date?: string;
    deviceType?: string;
    verifiedWorkEmail?: string;
  }[] = [];
  if (status === "pending") {
    const usersWithPartial = await getPartialApplications({
      search: queryParams.search,
      filters: queryParams.filters,
    });
    usersWithPartial.data.forEach((user) => {
      data.push({
        username: user.user_name,
        myGovIdEmail: user.govid_email || "",
        firstName: user.flow_data?.firstName,
        lastName: user.flow_data?.lastName,
        workEmail: user.flow_data?.govIEEmail,
        applicationStatus: user.flow_data ? "Started" : "Not Started",
        date: user.updated_at ? web.formatDate(user.updated_at) : "",
        deviceType: user.flow_data?.deviceType,
        verifiedWorkEmail: user.flow_data?.verifiedGovIEEmail ? "Yes" : "No",
      });
    });
  } else {
    const submissions = await getSubmissions({
      status: (status as Exclude<Pages, "pending">) || "submitted",
      filters: queryParams.filters,
      search: queryParams.search,
    });
    submissions.data.rows.forEach((submission) => {
      data.push({
        date: submission.updatedAt ? web.formatDate(submission.updatedAt) : "",
        firstName: submission.flowData.firstName,
        lastName: submission.flowData.lastName,
        myGovIdEmail: submission.flowData.myGovIdEmail,
        workEmail: submission.flowData.govIEEmail,
        deviceType: submission.flowData.deviceType,
        verifiedWorkEmail: submission.flowData.verifiedGovIEEmail
          ? "Yes"
          : "No",
      });
    });
  }

  const headers = new Headers();

  const buffer = writeToBuffer(data, { headers: true });
  headers.append(
    "Content-Disposition",
    'attachment; filename="digital-wallets-submissions.csv"',
  );
  headers.append("Content-Type", "text/csv");

  return new Response(await buffer, { headers });
};
