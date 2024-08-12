import { Pool } from "pg";
import { PaginationParams } from "../../types/schemaDefinitions";
import { utils } from "../../utils";
import { isLifeEventsError, NotFoundError, ServerError } from "shared-errors";
import { SELECTABLE_TRANSPORTS } from "./shared-users";
import { UserPerOrganisation } from "../../types/usersSchemaDefinitions";

const ERROR_PROCESS = "GET_USERS";

export const getUsers = async (params: {
  pool: Pool;
  organisationId: string;
  pagination: Required<PaginationParams>;
  search?: string | undefined;
  transports?: string[];
  activeOnly?: boolean;
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

export const getUser = async (params: {
  pool: Pool;
  organisationId: string;
  userId: string;
  activeOnly: boolean;
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
          ouc.user_id = users.id
          ${params.activeOnly ? " AND ouc.invitation_status = 'accepted' " : ""}
      WHERE users.id = $2 ${params.activeOnly ? " AND users.user_status = 'active'" : ""}
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
    if (isLifeEventsError(error)) {
      throw error;
    }
    throw new ServerError(ERROR_PROCESS, `error fetching recipients`, error);
  } finally {
    client.release();
  }
};

export const getUsersPerImport = async (params: {
  pool: Pool;
  organisationId: string;
  pagination: Required<PaginationParams>;
  search?: string | undefined;
  transports?: string[];
  importId: string;
  activeOnly?: boolean;
}): Promise<{ recipients: UserPerOrganisation[]; total: number }> => {
  const client = await params.pool.connect();
  try {
    const queries = buildGetRecipientsPerImportQueries(params);
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
  activeOnly?: boolean;
}): {
  count: { query: string; values: (string | number)[] };
  data: { query: string; values: (string | number)[] };
} => {
  const whereClauses = params.activeOnly
    ? ["users.user_status = 'active'"]
    : [];
  let paginationIndex = 2;
  const queryValues = [params.organisationId];
  const search = params.search ? params.search.trim() : "";
  if (search.length > 0) {
    whereClauses.push(
      `(${[
        `users.email ILIKE $2`,
        `users.details->>'firstName' ILIKE $2`,
        `users.details->>'lastName' ILIKE $2`,
      ].join(" OR ")})`,
    );
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
    whereClauses.push(`ouc.preferred_transports && $${paginationIndex++}`);
    queryValues.push(utils.postgresArrayify(transports));
  }

  const whereClause = whereClauses.length
    ? ` WHERE ${whereClauses.join(" AND ")} `
    : " ";

  const dataSelect = `SELECT 
        ${getUserFieldsToSelect()}
        FROM users
        JOIN organisation_user_configurations ouc ON 
            ouc.organisation_id = $1 AND
            ouc.user_id = users.id
            ${params.activeOnly ? "AND ouc.invitation_status = 'accepted'" : ""}
        ${whereClause}
        ORDER BY users.id DESC
        LIMIT $${paginationIndex++} OFFSET $${paginationIndex}
    `;
  return {
    count: {
      query: `
        SELECT COUNT(*) as count 
        FROM users
        JOIN organisation_user_configurations ouc ON 
            ouc.organisation_id = $1 AND
            ouc.user_id = users.id
            ${params.activeOnly ? "AND ouc.invitation_status = 'accepted'" : ""}
        ${whereClause}
      `,
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

const buildGetRecipientsPerImportQueries = (params: {
  organisationId: string;
  pagination: { limit: number; offset: number };
  search?: string;
  transports?: string[];
  activeOnly?: boolean;
  importId: string;
}): {
  count: { query: string; values: (string | number)[] };
  data: { query: string; values: (string | number)[] };
} => {
  const whereClauses = params.activeOnly
    ? ["users.user_status = 'active'"]
    : [];
  let paginationIndex = 3;
  const queryValues = [params.importId, params.organisationId];
  const search = params.search ? params.search.trim() : "";
  if (search.length > 0) {
    whereClauses.push(
      `(${[
        `users.email ILIKE $3`,
        `users.details->>'firstName' ILIKE $3`,
        `users.details->>'lastName' ILIKE $3`,
      ].join(" OR ")})`,
    );
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
    whereClauses.push(`ouc.preferred_transports && $${paginationIndex++}`);
    queryValues.push(utils.postgresArrayify(transports));
  }

  const whereClause = whereClauses.length
    ? ` WHERE ${whereClauses.join(" AND ")} `
    : " ";

  const extractIdsQuery = `
    WITH extracted_ids AS (
      SELECT jsonb_array_elements(users_data) ->> 'relatedUserId' AS related_user_id
      FROM users_imports
      WHERE import_id = $1 and organisation_id = $2
    )
  `;

  const dataSelect = `
    ${extractIdsQuery}
    SELECT 
      ${getUserFieldsToSelect()}
    FROM users
    JOIN organisation_user_configurations ouc ON 
        ouc.organisation_id = $2 AND
        ouc.user_id = users.id
        ${params.activeOnly ? "AND ouc.invitation_status = 'accepted'" : ""}
    JOIN extracted_ids ei ON users.id::text = ei.related_user_id
    ${whereClause}
    ORDER BY users.id DESC
    LIMIT $${paginationIndex++} OFFSET $${paginationIndex}
  `;

  const countSelect = `
    ${extractIdsQuery}
    SELECT 
      ${getUserFieldsToSelect()}
    FROM users
    JOIN organisation_user_configurations ouc ON 
        ouc.organisation_id = $2 AND
        ouc.user_id = users.id
        ${params.activeOnly ? "AND ouc.invitation_status = 'accepted'" : ""}
    JOIN extracted_ids ei ON users.id::text = ei.related_user_id
    ${whereClause}
  `;

  return {
    count: {
      query: countSelect,
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

const getUserFieldsToSelect = () => `
  users.id as "userId",
  users.user_profile_id as "userProfileId",
  users.phone as "phoneNumber",
  users.email as "emailAddress",
  users.details->>'firstName' as "firstName",
  users.details->>'lastName' as "lastName",
  users.details->>'birthDate' as "birthDate",
  users.details->>'publicIdentityId' as "ppsn",
  ouc.id as "organisationSettingId",
  ouc.preferred_transports as "organisationPreferredTransports",
  ouc.organisation_id as "organisationId",
  ouc.invitation_status as "organisationInvitationStatus",
  ouc.invitation_sent_at  as "organisationInvitationSentAt",
  ouc.invitation_feedback_at as "organisationInvitationFeedbackAt",
  users.correlation_quality as "correlationQuality",
  users.user_status as "userStatus",
  'en' as lang
`;
