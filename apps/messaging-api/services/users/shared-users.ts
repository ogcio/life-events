import { createError } from "@fastify/error";
import { Pool, PoolClient, QueryResult } from "pg";
import { isNativeError } from "util/types";
import {
  User,
  UserInvitation,
  UsersImport,
} from "../../types/usersSchemaDefinitions";
import { Profile } from "building-blocks-sdk";

const getUser = async (params: {
  client: PoolClient;
  whereClauses: string[];
  whereValues: string[];
  errorCode: string;
  logicalWhereOperator?: string;
}): Promise<User> => {
  let result: QueryResult<User>;
  try {
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
        correlation_quality as "correlationQuality"    
        FROM users where ${params.whereClauses.join(operator)} LIMIT 1
      `,
      params.whereValues,
    );
  } catch (error) {
    const message = isNativeError(error) ? error.message : "unknown error";
    throw createError(
      params.errorCode,
      `Error retrieving user: ${message}`,
      500,
    )();
  }

  if (!result || result.rowCount === 0) {
    throw createError(params.errorCode, "Cannot find the user", 404)();
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
}): Promise<User> =>
  getUser({
    client: params.client,
    whereClauses: ["user_profile_id = $1"],
    whereValues: [params.userProfileId],
    errorCode: params.errorCode,
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
  });
};

export const getUserImports = async (params: {
  client: PoolClient;
  whereClauses: string[];
  whereValues: string[];
  errorCode: string;
  logicalWhereOperator?: string;
  limit?: number;
  includeUsersData: boolean;
}): Promise<UsersImport[]> => {
  try {
    const usersDataClause = params.includeUsersData
      ? 'users_data as "usersData",'
      : "";
    const limitClause = params.limit ? `LIMIT ${params.limit}` : "";
    const operator = params.logicalWhereOperator
      ? ` ${params.logicalWhereOperator} `
      : " AND ";
    const result = await params.client.query<UsersImport>(
      `
        SELECT 
            organisation_id as "organisationId",
            imported_at as "importedAt",
            ${usersDataClause}
            import_channel as "importChannel",
            retry_count as "retryCount",
            last_retry_at as "lastRetryAt",
            import_id as "importId"
        FROM users_imports where ${params.whereClauses.join(operator)} ${limitClause}
      `,
      params.whereValues,
    );

    return result.rows;
  } catch (error) {
    const message = isNativeError(error) ? error.message : "unknown error";
    throw createError(
      params.errorCode,
      `Error retrieving user imports: ${message}`,
      500,
    )();
  }
};

export const getUserInvitationsForOrganisation = async (params: {
  client: PoolClient;
  organisationId: string;
  whereClauses: string[];
  whereValues: string[];
  errorCode: string;
  logicalWhereOperator?: string;
  limit?: number;
}): Promise<UserInvitation[]> => {
  try {
    const limitClause = params.limit ? `LIMIT ${params.limit}` : "";
    const organisationIndex = `$${params.whereValues.length + 1}`;
    const operator = params.logicalWhereOperator
      ? ` ${params.logicalWhereOperator} `
      : " AND ";

    const result = await params.client.query<UserInvitation>(
      `
        SELECT 
            ouc.user_id as "id",
                users.user_profile_id as "userProfileId",
                users.email as "email",
                users.phone as "phone",
                users.details as "details",
                ouc.organisation_id as "organisationId",
                ouc.invitation_status as "organisationInvitationStatus",
                ouc.invitation_sent_at  as "organisationInvitationSentAt",
                ouc.invitation_feedback_at as "organisationInvitationFeedbackAt",
                ouc.preferred_transports as "organisationPreferredTransports",
                users.correlation_quality as "correlationQuality",
                users.user_status as "userStatus"
            from users
            left join organisation_user_configurations ouc on ouc.user_id = users.id 
            	and ouc.organisation_id = ${organisationIndex}
            left join users_imports on users_imports.organisation_id = ouc.organisation_id 
            where ${params.whereClauses.join(operator)} ${limitClause}
      `,
      [...params.whereValues, params.organisationId],
    );

    return result.rows;
  } catch (error) {
    const message = isNativeError(error) ? error.message : "unknown error";
    throw createError(
      params.errorCode,
      `Error retrieving user invitations: ${message}`,
      500,
    )();
  }
};

export const getUserProfiles = async (ids: string[], pool: Pool) => {
  return await pool
    .query<{
      firstName: string;
      lastName: string;
      ppsn: string;
      id: string;
      lang: string;
    }>(
      `
    select 
      (details ->> 'firstName') as "firstName",
      (details ->> 'lastName') as "firstName",
      (details ->> 'publicIdentityId') as "ppsn",
      user_profile_id as "id",
      'en' as "lang"
    from users
    where user_profile_id = any ($1)
    `,
      [ids],
    )
    .then((res) => res.rows);
};

export function ProfileSdkFacade(
  sdkProfile: Profile,
  messagingProfile: {
    selectUsers(ids: string[]): Promise<
      {
        firstName: string;
        lastName: string;
        ppsn: string;
        id: string;
        lang: string;
      }[]
    >;
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

      const idsNotFound: string[] = [];
      if (fromProfile.length) {
        const set = new Set(fromProfile.map((d) => d.id));
        for (const id of ids) {
          if (!set.has(id)) {
            idsNotFound.push(id);
          }
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
