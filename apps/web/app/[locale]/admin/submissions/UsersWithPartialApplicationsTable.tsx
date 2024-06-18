import { getTranslations } from "next-intl/server";
import { workflow } from "../../../utils";
import { pgpool as sharedPgPgool } from "auth/sessions";
import { pgpool } from "../../../utils/postgres";
import { SubmissionsTableProps } from "./page";
import Pagination from "./components/Pagination";
import {
  PaginationLinks,
  getPaginationLinks,
  getQueryParams,
} from "./components/paginationUtils";
import TableControls from "./components/TableControls/TableControls";
import { QueryResult } from "pg";

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

const getPartialApplications = async (
  pageSize: number,
  offset: number,
  search?: string,
) => {
  // Step 1: Fetch users from the shared DB - CHANGE THIS AFTER LOGTO INTEGRATION
  const allUsersQueryBase = `SELECT * FROM users WHERE is_public_servant = false`;
  let usersQueryResult: QueryResult<User>;
  let usersFullQuery = `${allUsersQueryBase}`;
  const searchQuery = search?.trim();
  if (searchQuery) {
    usersQueryResult = await sharedPgPgool.query<User>({
      text: `${usersFullQuery} AND ( 
      govid_email ILIKE '%' || $1 || '%'
      OR user_name ILIKE '%' || $1 || '%')`,
      values: [searchQuery],
    });
  } else {
    usersQueryResult = await sharedPgPgool.query<User>({
      text: usersFullQuery,
    });
  }

  // Extract user IDs
  const ids = usersQueryResult.rows.map((row) => row.id);

  const usersWithPartial: (User & {
    [K in keyof DigitalWalletFlow]?: DigitalWalletFlow[K];
  })[] = [];
  // Step 2: Fetch geDigitalWallet flow data for users registered
  if (ids.length > 0) {
    let flowQueryResult: QueryResult<DigitalWalletFlow>;
    const partialFlowsBaseQuery = `SELECT user_id, flow, flow_data FROM user_flow_data WHERE flow = 'getDigitalWallet' AND user_id = ANY($1)`;
    if (searchQuery) {
      flowQueryResult = await pgpool.query({
        name: "getDigitalWalletFlowDataWithSearch",
        text: `${partialFlowsBaseQuery} AND (
        (flow_data ->> 'govIEEmail') ILIKE $2
        OR (flow_data ->> 'myGovIdEmail') ILIKE $2
        OR (flow_data ->> 'firstName') ILIKE $2
        OR (flow_data ->> 'lastName') ILIKE $2
      )`,
        values: [ids, `%${searchQuery}%`],
      });
    } else {
      flowQueryResult = await pgpool.query({
        name: "getDigitalWalletFlowData",
        text: partialFlowsBaseQuery,
        values: [ids],
      });
    }

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
  const url = `${process.env.HOST_URL}/${params.locale}/admin/submissions?status=pending`;

  const queryParams = getQueryParams(urlParms);
  const usersWithPartial = await getPartialApplications(
    queryParams.limit,
    queryParams.offset,
    queryParams.search,
  );

  const links: PaginationLinks = getPaginationLinks({
    url,
    limit: queryParams.limit,
    offset: queryParams.offset,
    totalCount: usersWithPartial.totalCount,
  });

  return (
    <>
      <TableControls
        itemsCount={usersWithPartial.totalCount}
        baseUrl={url}
        {...queryParams}
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
      <Pagination currentPage={queryParams.page} links={links} />
    </>
  );
};
