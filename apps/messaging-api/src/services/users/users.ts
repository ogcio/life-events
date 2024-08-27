import { Pool } from "pg";
import { PaginationParams } from "../../types/schemaDefinitions.js";
import { utils } from "../../utils.js";
import { isLifeEventsError, NotFoundError, ServerError } from "shared-errors";
import { SELECTABLE_TRANSPORTS } from "./shared-users.js";
import { UserPerOrganisation } from "../../types/usersSchemaDefinitions.js";

const ERROR_PROCESS = "GET_USERS";

export const getUsers = async (params: {
  pool: Pool;
  organisationId: string;
  pagination: Required<PaginationParams>;
  search?: string | undefined;
  transports?: string[];
  activeOnly?: boolean;
  importId?: string;
}): Promise<{ recipients: UserPerOrganisation[]; total: number }> => {
  const client = await params.pool.connect();
  try {
    const importId = params.importId;
    const queries = importId
      ? buildGetRecipientsPerImportQueries({ ...params, importId })
      : buildGetRecipientsQueries(params);

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
      ${getCoreQuery({ activeOnly: params.activeOnly, isForCount: false })}
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

const buildGetRecipientsQueries = (params: {
  organisationId: string;
  pagination: { limit: string; offset: string };
  search?: string;
  transports?: string[];
  activeOnly?: boolean;
}): {
  count: { query: string; values: (string | number)[] };
  data: { query: string; values: (string | number)[] };
} => {
  const whereHelper = prepareWhereClauses(params);
  let nextIndexInQuery = whereHelper.nextIndexInQuery;

  const dataSelect = `
        ${getCoreQuery({ activeOnly: params.activeOnly, isForCount: false })}
        ${whereHelper.whereClauses}
        ORDER BY users.id DESC
        LIMIT $${nextIndexInQuery++} OFFSET $${nextIndexInQuery}
    `;
  return {
    count: {
      query: `
        ${getCoreQuery({ activeOnly: params.activeOnly, isForCount: true })}
        ${whereHelper.whereClauses}
      `,
      values: whereHelper.queryValues,
    },
    data: {
      query: dataSelect,
      values: [
        ...whereHelper.queryValues,
        params.pagination.limit,
        params.pagination.offset,
      ],
    },
  };
};

const buildGetRecipientsPerImportQueries = (params: {
  organisationId: string;
  pagination: { limit: string; offset: string };
  search?: string;
  transports?: string[];
  activeOnly?: boolean;
  importId: string;
}): {
  count: { query: string; values: (string | number)[] };
  data: { query: string; values: (string | number)[] };
} => {
  const whereHelper = prepareWhereClauses(params);
  let nextIndexInQuery = whereHelper.nextIndexInQuery;

  const extractIdsQuery = `
    WITH extracted_ids AS (
      SELECT jsonb_array_elements(users_data) ->> 'relatedUserId' AS related_user_id
      FROM users_imports
      WHERE import_id = $${nextIndexInQuery++} and organisation_id = $1
    )
  `;

  const dataSelect = `
    ${extractIdsQuery}
    ${getCoreQuery({ activeOnly: params.activeOnly, isForCount: false })}
    JOIN extracted_ids ei ON users.id::text = ei.related_user_id
    ${whereHelper.whereClauses}
    ORDER BY users.id DESC
    LIMIT $${nextIndexInQuery++} OFFSET $${nextIndexInQuery}
  `;

  const countSelect = `
    ${extractIdsQuery}
    ${getCoreQuery({ activeOnly: params.activeOnly, isForCount: true })}
    JOIN extracted_ids ei ON users.id::text = ei.related_user_id
    ${whereHelper.whereClauses}
  `;

  return {
    count: {
      query: countSelect,
      values: [...whereHelper.queryValues, params.importId],
    },
    data: {
      query: dataSelect,
      values: [
        ...whereHelper.queryValues,
        params.importId,
        params.pagination.limit,
        params.pagination.offset,
      ],
    },
  };
};

const getCoreQuery = (params: {
  activeOnly: boolean | undefined;
  isForCount: boolean;
}) => {
  let fieldsToSelect = "SELECT COUNT(*) as count ";
  if (!params.isForCount) {
    fieldsToSelect = `
      SELECT 
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
  }

  return `
    ${fieldsToSelect}
    FROM users
    JOIN organisation_user_configurations ouc ON 
        ouc.organisation_id = $1 AND
        ouc.user_id = users.id
        ${(params.activeOnly ?? false) ? "AND ouc.invitation_status = 'accepted'" : ""}`;
};

const prepareWhereClauses = (params: {
  activeOnly?: boolean;
  organisationId: string;
  search?: string;
  transports?: string[];
}): {
  whereClauses: string;
  queryValues: (string | number)[];
  nextIndexInQuery: number;
} => {
  let nextIndexInQuery = 2;
  const whereClauses = params.activeOnly
    ? ["users.user_status = 'active'"]
    : [];
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
    nextIndexInQuery++;
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
    whereClauses.push(`ouc.preferred_transports && $${nextIndexInQuery++}`);
    queryValues.push(utils.postgresArrayify(transports));
  }

  const whereClause = whereClauses.length
    ? ` WHERE ${whereClauses.join(" AND ")} `
    : " ";

  return {
    whereClauses: whereClause,
    queryValues,
    nextIndexInQuery,
  };
};
