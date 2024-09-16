import { PoolClient, QueryResult } from "pg";
import { isNativeError } from "util/types";
import {
  OrganisationSetting,
  User,
  UsersImport,
} from "../../types/usersSchemaDefinitions.js";
import { Profile } from "building-blocks-sdk";
import { NotFoundError, ServerError } from "shared-errors";
import { PaginationParams } from "../../types/schemaDefinitions.js";

const getUser = async (params: {
  client: PoolClient;
  whereClauses: string[];
  whereValues: string[];
  errorCode: string;
  logicalWhereOperator?: string;
  withDetails?: boolean;
}): Promise<User> => {
  let result: QueryResult<User>;
  try {
    const detailsQuery = params.withDetails ? 'details as "details",' : "";
    const operator = params.logicalWhereOperator
      ? ` ${params.logicalWhereOperator} `
      : " AND ";
    result = await params.client.query<User>(
      `
        SELECT 
        id as "id",
        user_profile_id as "userProfileId",
        importer_organisation_id as "importerOrganisationId",
        user_status as "userStatus",
        ${detailsQuery}
        correlation_quality as "correlationQuality"    
        FROM users where ${params.whereClauses.join(operator)} LIMIT 1
      `,
      params.whereValues,
    );
  } catch (error) {
    const message = isNativeError(error) ? error.message : "unknown error";
    throw new ServerError(
      params.errorCode,
      `Error retrieving user: ${message}`,
    );
  }

  if (!result || result.rowCount === 0) {
    throw new NotFoundError(params.errorCode, "Cannot find the user");
  }

  return result.rows[0];
};

export const getUserById = async (params: {
  client: PoolClient;
  userId: string;
  errorCode: string;
}): Promise<User> =>
  getUser({
    client: params.client,
    whereClauses: ["id = $1"],
    whereValues: [params.userId],
    errorCode: params.errorCode,
  });

export const getUserByUserProfileId = async (params: {
  userProfileId: string;
  client: PoolClient;
  errorCode: string;
  withDetails?: boolean;
}): Promise<User> =>
  getUser({
    client: params.client,
    whereClauses: ["user_profile_id = $1"],
    whereValues: [params.userProfileId],
    errorCode: params.errorCode,
    withDetails: params.withDetails,
  });

export const getUserByContacts = async (params: {
  email: string | null;
  phone: string | null;
  client: PoolClient;
  errorCode: string;
}): Promise<User> => {
  const clauses = [];
  const values = [];
  let phoneIndex = 1;
  if (params.email) {
    clauses.push("email = $1");
    values.push(params.email);
    phoneIndex = 2;
  }

  if (params.phone) {
    clauses.push(`phone = $${phoneIndex}`);
    values.push(params.phone);
  }

  return getUser({
    client: params.client,
    whereClauses: clauses,
    whereValues: values,
    errorCode: params.errorCode,
    logicalWhereOperator: "OR",
    withDetails: true,
  });
};

export const getUserImports = async (params: {
  client: PoolClient;
  whereClauses: string[];
  whereValues: string[];
  errorCode: string;
  logicalWhereOperator?: string;
  limit?: number;
  offset?: number;
  includeUsersData: boolean;
}): Promise<{ data: UsersImport[]; totalCount: number }> => {
  try {
    const usersDataClause = params.includeUsersData
      ? 'users_data as "usersData",'
      : "";
    const limitClause = params.limit ? `LIMIT ${params.limit}` : "";
    const offsetClause = params.offset ? `OFFSET ${params.offset}` : "";
    const operator = params.logicalWhereOperator
      ? ` ${params.logicalWhereOperator} `
      : " AND ";
    const toSelectFields = `
        SELECT 
          organisation_id as "organisationId",
          imported_at as "importedAt",
          ${usersDataClause}
          import_channel as "importChannel",
          retry_count as "retryCount",
          last_retry_at as "lastRetryAt",
          import_id as "id"
      `;
    const fromQuery = `FROM users_imports where ${params.whereClauses.join(operator)}`;
    const result = params.client.query<UsersImport>(
      `
        ${toSelectFields}
        ${fromQuery}
        ${limitClause}
        ${offsetClause}
      `,
      params.whereValues,
    );
    const countResult = params.client.query<{ total: number }>(
      `
        SELECT COUNT(*) as total ${fromQuery};
      `,
      params.whereValues,
    );
    return {
      data: (await result).rows,
      totalCount: (await countResult).rows[0].total,
    };
  } catch (error) {
    const message = isNativeError(error) ? error.message : "unknown error";
    throw new ServerError(
      params.errorCode,
      `Error retrieving user imports: ${message}`,
    );
  }
};

export const getSettingsPerUser = async (params: {
  client: PoolClient;
  userId: string;
  organisationSettingId?: string;
  errorCode: string;
  limit?: number;
  includeUserDetails?: boolean;
  offset?: number;
}): Promise<{ data: OrganisationSetting[]; totalCount: number }> => {
  try {
    const inputWhereValues = [params.userId];
    const inputWhereClauses = ["users.id = $1"];
    if (params.organisationSettingId) {
      inputWhereClauses.push("ouc.id = $2");
      inputWhereValues.push(params.organisationSettingId);
    }
    const limitClause = params.limit ? `LIMIT ${params.limit}` : "";
    const offsetClause = params.offset ? `OFFSET ${params.offset}` : "";
    const operator = " AND ";

    const whereClauses =
      inputWhereClauses.length > 0
        ? `WHERE ${inputWhereClauses.join(operator)} `
        : "";
    const dataFieldsToSelect = `
        ouc.id as "id",
        ouc.user_id as "userId",
        users.user_profile_id as "userProfileId",
        users.email as "emailAddress",
        users.phone as "phoneNumber",
        ${(params.includeUserDetails ?? true) ? 'users.details as "details"' : ""},
        ouc.organisation_id as "organisationId",
        ouc.invitation_status as "organisationInvitationStatus",
        ouc.invitation_sent_at  as "organisationInvitationSentAt",
        ouc.invitation_feedback_at as "organisationInvitationFeedbackAt",
        ouc.preferred_transports as "organisationPreferredTransports",
        users.correlation_quality as "correlationQuality",
        users.user_status as "userStatus"
      `;

    const result = params.client.query<OrganisationSetting>(
      `
          SELECT
            ${dataFieldsToSelect}
            from users
            left join organisation_user_configurations ouc on ouc.user_id = users.id
            ${whereClauses} ${limitClause} ${offsetClause}
        `,
      inputWhereValues,
    );
    const countResult = params.client.query<{ total: number }>(
      `
        SELECT COUNT(*) as total
        from users
        left join organisation_user_configurations ouc on ouc.user_id = users.id
        ${whereClauses}
        ;
      `,
      inputWhereValues,
    );
    return {
      data: (await result).rows,
      totalCount: (await countResult).rows[0].total,
    };
  } catch (error) {
    throw new ServerError(
      params.errorCode,
      `Error retrieving organisation settings`,
      error,
    );
  }
};

export const getSettingsPerUserProfile = async (params: {
  client: PoolClient;
  userProfileId: string;
  errorCode: string;
  pagination?: PaginationParams;
}): Promise<{ data: OrganisationSetting[]; totalCount: number }> => {
  const { client, userProfileId, errorCode } = params;
  const userByProfile = await getUserByUserProfileId({
    client,
    userProfileId,
    errorCode: errorCode,
  });
  return getSettingsPerUser({
    client,
    userId: userByProfile.id,
    errorCode: errorCode,
  });
};

export type MessagingUserProfile = {
  firstName: string;
  lastName: string;
  ppsn: string;
  id: string;
  preferredLanguage: string;
  phone: string;
  email: string;
};

export const getUserProfiles = async (
  ids: string[],
  poolClient: PoolClient,
): Promise<MessagingUserProfile[]> => {
  return await poolClient
    .query<MessagingUserProfile>(
      `
    select 
      (details ->> 'firstName') as "firstName",
      (details ->> 'lastName') as "lastName",
      (details ->> 'publicIdentityId') as "ppsn",
      COALESCE(user_profile_id, id::text) as "id",
      'en' as "preferredLanguage",
      phone,
      email
    from users
    where user_profile_id = any ($1) or id::text = any ($1)
    `,
      [ids],
    )
    .then((res) => res.rows);
};

export function ProfileSdkFacade(
  sdkProfile: Profile,
  messagingProfile: {
    selectUsers(ids: string[]): ReturnType<typeof getUserProfiles>;
  },
): Omit<Profile, "client"> {
  return {
    createAddress: sdkProfile.createAddress,
    createUser: sdkProfile.createUser,
    deleteAddress: sdkProfile.deleteAddress,
    findUser: sdkProfile.findUser,
    getAddress: sdkProfile.getAddress,
    getAddresses: sdkProfile.getAddresses,
    getEntitlements: sdkProfile.getEntitlements,
    getUser: sdkProfile.getUser,
    async selectUsers(ids: string[]) {
      const profileResult = await sdkProfile.selectUsers(ids);

      const fromProfile = profileResult.data || [];

      if (fromProfile.length === ids.length) {
        return { data: fromProfile, error: undefined };
      }

      const idsNotFound: string[] = [];
      const set = new Set(fromProfile.map((d: { id: string }) => d.id));
      for (const id of ids) {
        if (!set.has(id)) {
          idsNotFound.push(id);
        }
      }

      const fromMessage = idsNotFound.length
        ? await messagingProfile.selectUsers(idsNotFound)
        : [];

      return { data: fromProfile.concat(fromMessage), error: undefined };
    },
    patchAddress: sdkProfile.patchAddress,
    patchUser: sdkProfile.patchUser,
    updateAddress: sdkProfile.updateAddress,
    updateUser: sdkProfile.updateUser,
  };
}

export enum AvailableTransports {
  SMS = "sms",
  EMAIL = "email",
  LIFE_EVENT = "lifeEvent",
}

export const ALL_TRANSPORTS = [
  AvailableTransports.EMAIL,
  AvailableTransports.SMS,
  AvailableTransports.LIFE_EVENT,
];

// LifeEvent is mandatory
export const SELECTABLE_TRANSPORTS = [
  AvailableTransports.EMAIL,
  AvailableTransports.SMS,
];
