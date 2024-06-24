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
  filters?: Record<string, string>,
) => {
  // Step 1: Fetch users from the shared DB - CHANGE THIS AFTER LOGTO INTEGRATION
  const baseUserQuery = `SELECT * FROM users WHERE is_public_servant = false`;
  let usersQuery = baseUserQuery;
  const searchQuery = search?.trim();
  const queryParams: (string | string[])[] = [];

  if (searchQuery) {
    usersQuery += ` AND (govid_email ILIKE $1 OR user_name ILIKE $1)`;
    queryParams.push(`%${searchQuery}%`);
  }

  const usersQueryResult: QueryResult<User> = await sharedPgPgool.query<User>(
    usersQuery,
    queryParams,
  );

  // Extract user IDs
  const userIds = usersQueryResult.rows.map((row) => row.id);

  if (userIds.length === 0) {
    return {
      data: [],
      totalCount: 0,
      totalPages: 0,
    };
  }

  // Step 2: Fetch geDigitalWallet flow data for users registered
  const baseFlowQuery = `
    SELECT user_id, flow, flow_data 
    FROM user_flow_data 
    WHERE flow = 'getDigitalWallet' AND user_id = ANY($1)
  `;
  let flowQuery = baseFlowQuery;
  queryParams.length = 0; // Reset queryParams for reuse
  let paramIndex = 2;
  queryParams.push(userIds);

  if (searchQuery) {
    flowQuery += ` AND (
      (flow_data ->> 'govIEEmail') ILIKE $${paramIndex}
      OR (flow_data ->> 'myGovIdEmail') ILIKE $${paramIndex}
      OR (flow_data ->> 'firstName') ILIKE $${paramIndex}
      OR (flow_data ->> 'lastName') ILIKE $${paramIndex}
    )`;
    queryParams.push(`%${searchQuery}%`);
    paramIndex++;
  }

  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      flowQuery += ` AND (flow_data ->> $${paramIndex} = $${paramIndex + 1})`;
      queryParams.push(key);
      queryParams.push(value);
      paramIndex += 2;
    }
  }

  const flowQueryResult: QueryResult<DigitalWalletFlow> = await pgpool.query(
    flowQuery,
    queryParams,
  );

  const userMap = new Map<string, User>(
    usersQueryResult.rows.map((user) => [user.id, user]),
  );

  const usersWithPartial: (User & {
    [K in keyof DigitalWalletFlow]?: DigitalWalletFlow[K];
  })[] = [];

  flowQueryResult.rows.forEach((row) => {
    if (row.flow_data.confirmedApplication === "") {
      // If the user has a flow but it's not confirmed, add it to the list
      const user = userMap.get(row.user_id);
      if (user) {
        usersWithPartial.push({ ...user, ...row });
        userMap.delete(row.user_id); // Only add the user once
      }
    } else if (row.flow_data.confirmedApplication.length > 0) {
      // If the user has a confirmed application, remove them from the list
      const user = userMap.get(row.user_id);
      if (user) {
        userMap.delete(row.user_id); // Only add the user once
      }
    }
  });

  // if filters are applied don't display users with no flow
  if (!filters || Object.keys(filters).length === 0) {
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
    queryParams.filters,
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
        status="pending"
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
                  {row.flow_data ? t("started") : t("notStarted")}
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
