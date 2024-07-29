import { Pool } from "pg";
import { PaginationParams } from "../../types/schemaDefinitions";
import { utils } from "../../utils";
import { NotFoundError, ServerError } from "shared-errors";
import { SELECTABLE_TRANSPORTS } from "./shared-users";
import { UserPerOrganisation } from "../../types/usersSchemaDefinitions";

const ERROR_PROCESS = "GET_USERS";

export const getUsers = async (params: {
  pool: Pool;
  organisationId: string;
  pagination: Required<PaginationParams>;
  search?: string | undefined;
  transports?: string[];
  importId?: string;
}): Promise<{ recipients: UserPerOrganisation[]; total: number }> => {
  const client = await params.pool.connect();
  try {
    const queries = buildGetRecipientsQueries(params);
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
  importId?: string;
}): {
  count: { query: string; values: (string | number)[] };
  data: { query: string; values: (string | number)[] };
} => {
  let searchWhereClause = "";
  let transportsWhereClause = "";
  let joinUsersImports = "";
  let paginationIndex = 2;
  let whereClauseIndex = 2;
  const queryValues = [params.organisationId];
  const search = params.search ? params.search.trim() : "";
  if (params.importId) {
    joinUsersImports = `
      JOIN users_imports on import_id = $2
    `;
    whereClauseIndex++;
    paginationIndex++;
    queryValues.push(params.importId);
  }
  if (search.length > 0) {
    searchWhereClause = ` AND (${[
      `users.email ILIKE $${whereClauseIndex}`,
      `users.details->>'firstName' ILIKE $${whereClauseIndex}`,
      `users.details->>'lastName' ILIKE $${whereClauseIndex}`,
    ].join(" OR ")}) `;
    queryValues.push(`%${search}%`);
    paginationIndex++;
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
        FROM users
        JOIN organisation_user_configurations ouc ON 
            ouc.organisation_id = $1 AND
            ouc.user_id = users.id AND
            ouc.invitation_status = 'accepted'
        ${joinUsersImports}
        WHERE users.user_status = 'active' ${searchWhereClause} ${transportsWhereClause}
    `;

  const dataSelect = `SELECT 
        ${getUserFieldsToSelect()}
        ${basicQuery}
        ORDER BY users.id DESC
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
      ${getUserFieldsToSelect()}
      FROM users
      JOIN organisation_user_configurations ouc ON 
          ouc.organisation_id = $1 AND
          ouc.user_id = users.id AND
          ouc.invitation_status = 'accepted'
      WHERE users.user_status = 'active' and users.id = $2
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

const getUserFieldsToSelect = () => `
  users.id as "userId",
  users.user_profile_id as "userProfileId",
  users.phone as "phoneNumber",
  users.email as "emailAddress",
  users.details->>'firstName' as "firstName",
  users.details->>'lastName' as "lastName",
  users.details->>'birthDate' as "birthDate",
  users.details->>'publicIdentityId' as "ppsn",
  ouc.preferred_transports as "organisationPreferredTransports",
  ouc.organisation_id as "organisationId",
  ouc.invitation_status as "organisationInvitationStatus",
  ouc.invitation_sent_at  as "organisationInvitationSentAt",
  ouc.invitation_feedback_at as "organisationInvitationFeedbackAt",
  users.correlation_quality as "correlationQuality",
  users.user_status as "userStatus",
  'en' as lang
`;
