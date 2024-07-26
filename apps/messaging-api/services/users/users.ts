import { Pool } from "pg";
import { PaginationParams } from "../../types/schemaDefinitions";
import { utils } from "../../utils";
import { NotFoundError, ServerError } from "shared-errors";
import { sanitizePagination } from "../../utils/pagination";
import { SELECTABLE_TRANSPORTS } from "./shared-users";
import { UserPerOrganisation } from "../../types/usersSchemaDefinitions";

const ERROR_PROCESS = "GET_USERS";

export const getUsers = async (params: {
  pool: Pool;
  organisationId: string;
  pagination: PaginationParams;
  search?: string | undefined;
  transports?: string[];
}): Promise<{ recipients: UserPerOrganisation[]; total: number }> => {
  const client = await params.pool.connect();
  const pagination = sanitizePagination(params.pagination);
  try {
    const queries = buildGetRecipientsQueries({ ...params, pagination });
    const countResponse = client.query<{ count: number }>(
      queries.count.query,
      queries.count.values,
    );
    const response = client.query<UserPerOrganisation>(
      queries.data.query,
      queries.data.values,
    );

    return {
      recipients: (await response).rows,
      total: (await countResponse).rows[0].count,
    };
  } catch (error) {
    throw new ServerError(ERROR_PROCESS, `error fetching recipients`, error);
  } finally {
    client.release();
  }
};

const buildGetRecipientsQueries = (params: {
  organisationId: string;
  pagination: { limit: number; offset: number };
  search?: string;
  transports?: string[];
}): {
  count: { query: string; values: (string | number)[] };
  data: { query: string; values: (string | number)[] };
} => {
  let searchWhereClause = "";
  let transportsWhereClause = "";
  let paginationIndex = 2;
  const queryValues = [params.organisationId];
  const search = params.search ? params.search.trim() : "";
  if (search.length > 0) {
    searchWhereClause = ` AND (${[
      `u.email ILIKE $2`,
      `u.details->>'firstName' ILIKE $2`,
      `u.details->>'lastName' ILIKE $2`,
    ].join(" OR ")}) `;
    queryValues.push(`%${search}%`);
    paginationIndex = 3;
  }

  const transports = params.transports ?? [];
  // Search only across optional tranports
  // given that lifeEvents is always set as accepted
  const chosenTransports =
    transports.length === 0
      ? []
      : SELECTABLE_TRANSPORTS.filter((x) => transports.includes(x));

  if (chosenTransports.length > 0) {
    // at least one of the needed transports
    // is set as valid for the user
    transportsWhereClause = ` AND ouc.preferred_transports && $${paginationIndex++}`;
    queryValues.push(utils.postgresArrayify(transports));
  }

  const basicQuery = `
        FROM users u
        JOIN organisation_user_configurations ouc ON 
            ouc.organisation_id = $1 AND
            ouc.user_id = u.id AND
            ouc.invitation_status = 'accepted'
        WHERE u.user_status = 'active' ${searchWhereClause} ${transportsWhereClause}
    `;

  const dataSelect = `SELECT 
        ${getFieldsToSelect()}
        ${basicQuery}
        ORDER BY u.id DESC
        LIMIT $${paginationIndex++} OFFSET $${paginationIndex}
    `;

  return {
    count: {
      query: `SELECT COUNT(*) as count ${basicQuery}`,
      values: queryValues,
    },
    data: {
      query: dataSelect,
      values: [
        ...queryValues,
        params.pagination.limit,
        params.pagination.offset,
      ],
    },
  };
};

export const getUser = async (params: {
  pool: Pool;
  organisationId: string;
  userId: string;
}): Promise<UserPerOrganisation> => {
  const client = await params.pool.connect();
  try {
    const response = await client.query<UserPerOrganisation>(
      `
      SELECT
      ${getFieldsToSelect()}
      FROM users u
      JOIN organisation_user_configurations ouc ON 
          ouc.organisation_id = $1 AND
          ouc.user_id = u.id AND
          ouc.invitation_status = 'accepted'
      WHERE u.user_status = 'active' and u.id = $2
      LIMIT 1  
      `,
      [params.organisationId, params.userId],
    );
    if (response.rowCount === 0) {
      throw new NotFoundError(
        ERROR_PROCESS,
        `User with id ${params.userId} not found or inactive`,
      );
    }

    return response.rows[0];
  } catch (error) {
    throw new ServerError(ERROR_PROCESS, `error fetching recipients`, error);
  } finally {
    client.release();
  }
};

const getFieldsToSelect = () => `
  u.id as "userId",
  u.user_profile_id as "userProfileId",
  u.phone as "phoneNumber",
  u.email as "emailAddress",
  u.details->>'firstName' as "firstName",
  u.details->>'lastName' as "lastName",
  u.details->>'birthDate' as "birthDate",
  u.details->>'publicIdentityId' as "ppsn",
  ouc.preferred_transports as "organisationPreferredTransports",
  ouc.organisation_id as "organisationId",
  ouc.invitation_status as "organisationInvitationStatus",
  ouc.invitation_sent_at  as "organisationInvitationSentAt",
  ouc.invitation_feedback_at as "organisationInvitationFeedbackAt",
  users.correlation_quality as "correlationQuality",
  users.user_status as "userStatus",
  'en' as lang
`;
