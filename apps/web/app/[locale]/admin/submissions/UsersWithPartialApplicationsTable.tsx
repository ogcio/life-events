import { getTranslations } from "next-intl/server";
import { workflow } from "../../../utils";
import { pgpool as sharedPgPgool } from "auth/sessions";
import { pgpool } from "../../../utils/postgres";
import { EventTableSearchParams, SubmissionsTableProps } from "./page";
import Pagination from "./components/Pagination";
import {
  PaginationLinks,
  getPaginationDataFromParams,
  getPaginationLinks,
} from "./components/paginationUtils";
import { link } from "fs";
import TableControls from "./components/TableControls/TableControls";

type User = {
  id: string;
  govid_email: string;
  govid: string;
  user_name: string;
  is_public_servant: boolean;
};

type DigitalWalletFlow = {
  user_id: string;
  category: "digital-wallet";
  flow: "getDigitalWallet";
  created_at: Date;
  updated_at: Date;
  flow_data: workflow.GetDigitalWallet;
};

const getPartialApplications = async (pageSize: number, offset: number) => {
  const allUsersQueryString = "FROM users WHERE is_public_servant = false";

  const totalCountQuery = `
  SELECT COUNT(*)
  ${allUsersQueryString}
  `;
  const totalCountResult = await sharedPgPgool.query<{ count: number }>(
    totalCountQuery,
  );
  // Step 1: Fetch users from the shared DB
  const allUsersQuery = `SELECT * ${allUsersQueryString}`;
  const usersQueryResult = await sharedPgPgool.query<User>(allUsersQuery);

  // Extract user IDs
  const ids = usersQueryResult.rows.map((row) => row.id);

  const usersWithPartial: (User & {
    [K in keyof DigitalWalletFlow]?: DigitalWalletFlow[K];
  })[] = [];
  // Step 2: Fetch geDigitalWallet flow data for users registered
  if (ids.length > 0) {
    const partialFlowsQuery = `SELECT user_id, flow, flow_data FROM user_flow_data WHERE flow = 'getDigitalWallet' AND user_id = ANY($1)`;
    const flowQueryResult = await pgpool.query<DigitalWalletFlow>(
      partialFlowsQuery,
      [ids],
    );

    // Step 3: Process and combine the results using efficient data structures
    const userMap = new Map<string, User>(
      usersQueryResult.rows.map((user) => [user.id, user]),
    );

    flowQueryResult.rows.forEach((row) => {
      if (row.flow_data.confirmedApplication === "") {
        const user = userMap.get(row.user_id);
        if (user) {
          usersWithPartial.push({ ...user, ...row });
        }
      }
      // Mark users who have flow data
      userMap.delete(row.user_id);
    });

    // Add remaining users without the specified flow
    userMap.forEach((user) => {
      usersWithPartial.push(user);
    });
  }

  const totalCount = usersWithPartial.length;
  return {
    data: usersWithPartial.slice(offset, offset + pageSize),
    totalCount: totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  };
};

export default async ({ searchParams, params }: SubmissionsTableProps) => {
  const t = await getTranslations("Admin.DigitalWalletPendingTable");

  const urlParms = new URLSearchParams(searchParams);
  const url = `${process.env.HOST_URL}${params.locale}/admin/submissions?status=pending`;

  const pagination = getPaginationDataFromParams(urlParms);
  const usersWithPartial = await getPartialApplications(
    pagination.limit,
    pagination.offset,
  );

  const links: PaginationLinks = getPaginationLinks({
    url,
    limit: pagination.limit,
    offset: pagination.offset,
    totalCount: usersWithPartial.totalCount,
  });

  return (
    <>
      <TableControls
        itemsCount={usersWithPartial.totalCount}
        itemsPerPage={pagination.limit}
        baseUrl={url}
      />
      <table className="govie-table">
        <thead className="govie-table__head">
          <tr className="govie-table__row">
            <th scope="col" className="govie-table__header">
              {t("nameColumn")}
            </th>
            <th scope="col" className="govie-table__header">
              {t("myGovIdEmailColumn")}
            </th>
            <th scope="col" className="govie-table__header">
              {t("workEmailColumn")}
            </th>
            <th scope="col" className="govie-table__header">
              {t("applicationStatusColumn")}
            </th>
          </tr>
        </thead>
        <tbody className="govie-table__body">
          {usersWithPartial.data.map((row) => {
            return (
              <tr key={row.id} className="govie-table__row">
                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  {row.user_name}
                </td>

                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  {row.govid_email}
                </td>

                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  {row.flow_data?.govIEEmail}
                </td>

                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  {row.flow_data ? "Started" : "Not started"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Pagination currentPage={pagination.page} links={links} />
    </>
  );
};
