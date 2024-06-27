import { Pool } from "pg";
import { PaginationParams } from "../../../types/schemaDefinitions";
import { Recipient } from "../../../types/usersSchemaDefinitions";
import { utils } from "../../../utils";
import { ServerError } from "shared-errors";

const normalizePagination = (
  pagination: PaginationParams,
): Required<PaginationParams> => {
  const maxAvailableLimit = 100;
  const minAvailableLimit = 1;
  const defaultLimit = 20;
  const minAvailableOffset = 0;
  const defaultOffset = 0;
  return {
    limit: Math.max(
      Math.min(maxAvailableLimit, pagination.limit ?? defaultLimit),
      minAvailableLimit,
    ),

    offset: Math.max(pagination.offset ?? defaultOffset, minAvailableOffset),
  };
};

export const getRecipients = async (params: {
  pool: Pool;
  organisationId: string;
  pagination: PaginationParams;
  search?: string | undefined;
  transports: string[];
}): Promise<{ recipients: Recipient[]; total: number }> => {
  const client = await params.pool.connect();
  const pagination = normalizePagination(params.pagination);
  try {
    const queries = buildGetRecipientsQueries({ ...params, pagination });
    console.log({ queries: queries.count });
    const countResponse = client.query<{ count: number }>(
      queries.count.query,
      queries.count.values,
    );
    const response = client.query<Recipient>(
      queries.data.query,
      queries.data.values,
    );

    return {
      recipients: (await response).rows,
      total: (await countResponse).rows[0].count,
    };
  } catch (error) {
    throw new ServerError("GET_RECIPIENTS", `error fetching recipients`);
  } finally {
    client.release();
  }
};

const buildGetRecipientsQueries = (params: {
  organisationId: string;
  pagination: { limit: number; offset: number };
  search?: string;
  transports: string[];
}): {
  count: { query: string; values: (string | number)[] };
  data: { query: string; values: (string | number)[] };
} => {
  let searchWhereClause = "";
  let transportsWhereClause = "";
  let paginationIndex = 2;
  const queryValues = [params.organisationId];
  let search = params.search ? params.search.trim() : "";
  if (search.length > 0) {
    search = `%${search}%`;
    searchWhereClause = ` AND (${[
      `u.email ILIKE $2`,
      `u.details->>'firstName' ILIKE $2`,
      `u.details->>'lastName' ILIKE $2`,
    ].join(" OR ")}) `;
    queryValues.push(search);
    paginationIndex = 3;
  }

  if (params.transports.length > 0) {
    // at least one of the needed transports
    // is set as valid for the user
    transportsWhereClause = ` AND ouc.preferred_transports && $${paginationIndex++}`;
    queryValues.push(utils.postgresArrayify(params.transports));
  }

  const dataSelect = `SELECT 
        u.id as "id",
        u.user_profile_id as "userProfileId",
        u.phone as "phoneNumber",
        u.email as "emailAddress",
        u.details->>'firstName' as "firstName",
        u.details->>'lastName' as "lastName",
        u.details->>'birthDate' as "birthDate",
        ouc.preferred_transports as "preferredTransports"
    `;
  const paginationQuery = `
        ORDER BY u.id DESC
        LIMIT $${paginationIndex++} OFFSET $${paginationIndex}
    `;
  const basicQuery = `
        FROM users u
        JOIN organisation_user_configurations ouc ON 
            ouc.organisation_id = $1 AND
            ouc.user_id = u.id AND
            ouc.invitation_status = 'accepted'
        WHERE u.user_status = 'active' ${searchWhereClause} ${transportsWhereClause}
    `;

  return {
    count: {
      query: `SELECT COUNT(*) as count ${basicQuery}`,
      values: queryValues,
    },
    data: {
      query: `${dataSelect} ${basicQuery} ${paginationQuery}`,
      values: [
        ...queryValues,
        params.pagination.limit,
        params.pagination.offset,
      ],
    },
  };
};
