import { createError } from "@fastify/error";
import { FastifyBaseLogger, FastifyError } from "fastify";
import { PoolClient } from "pg";
import {
  CorrelationQuality,
  OrganisationUserConfig,
  ToImportUser,
  User,
  UserStatus,
  UsersImport,
} from "../../../types/usersSchemaDefinitions";
import { isNativeError } from "util/types";
import { Profile } from "building-blocks-sdk";
import { RequestUser } from "../../../plugins/auth";
import { IMPORT_USERS_ERROR } from "./import-users";
import { processTagsPerUser } from "../../tags/manage-tags";

interface FoundUser {
  id: string;
  firstname: string;
  lastname: string;
  matchQuality: "exact" | "approximate";
}

export const mapUsers = async (params: {
  importId: string;
  client: PoolClient;
  logger: FastifyBaseLogger;
  requestUser: RequestUser;
}): Promise<void> => {
  if (process.env.SYNCHRONOUS_USER_IMPORT ?? 0) {
    return mapUsersSync(params);
  }

  return mapUsersAsync(params);
};

const mapUsersAsync = async (_params: {
  importId: string;
  client: PoolClient;
  logger: FastifyBaseLogger;
  requestUser: RequestUser;
}) => {
  // Here we will invoke the scheduler
  throw new Error("Not implemented yet");
};

const mapUsersSync = async (params: {
  importId: string;
  client: PoolClient;
  logger: FastifyBaseLogger;
  requestUser: RequestUser;
}) => {
  const usersImport = await getUsersImport(params);
  const profile = new Profile(params.requestUser.id);

  const processingUsers = usersImport.usersData.map(
    (toImportUser: ToImportUser) =>
      processToImportUser({
        profile,
        toImportUser,
        organisationId: usersImport.organisationId,
        client: params.client,
      }),
  );

  const processedUsers = await Promise.all(processingUsers);

  usersImport.usersData = processedUsers.map((user) => user.importedUser);
  usersImport.retryCount += 1;
  usersImport.lastRetryAt = new Date().toISOString();

  await updateUsersImport({ client: params.client, usersImport });
  // will send invitations here
};

const updateUsersImport = async (params: {
  client: PoolClient;
  usersImport: UsersImport;
}): Promise<UsersImport> => {
  try {
    const { usersImport, client } = params;
    await client.query(
      `
        UPDATE public.users_imports
        SET users_data=$1, retry_count=$2, last_retry_at=$3
        WHERE import_id=$4;
      `,
      [
        JSON.stringify(usersImport.usersData),
        usersImport.retryCount,
        usersImport.lastRetryAt,
        usersImport.importId,
      ],
    );

    return usersImport;
  } catch (error) {
    const message = isNativeError(error) ? error.message : "unknown error";
    const toOutput = createError(
      IMPORT_USERS_ERROR,
      `Error during updating users import on db: ${message}`,
      500,
    )();
    throw toOutput;
  }
};

const getUsersImport = async (params: {
  importId: string;
  client: PoolClient;
  logger: FastifyBaseLogger;
}): Promise<UsersImport> => {
  try {
    // for now the organisation id is randomic, we have
    // to decide where to store that value in relation to the
    // user
    const result = await params.client.query<UsersImport>(
      `
          select 
            organisation_id as "organisationId",
            imported_at as "importedAt",
            users_data as "usersData",
            import_channel as "importChannel",
            retry_count as "retryCount",
            last_retry_at as "lastRetryAt",
            import_id as "importId"
          from users_imports where import_id = $1
      `,
      [params.importId],
    );
    if (!result.rowCount) {
      throw new Error("Import id not found");
    }
    return result.rows[0];
  } catch (error) {
    const message = isNativeError(error) ? error.message : "unknown error";
    const toOutput = createError(
      IMPORT_USERS_ERROR,
      `Error during gettings users import from db: ${message}`,
      500,
    )();
    throw toOutput;
  }
};

const processUser = async (params: {
  userProfile: FoundUser;
  organisationId: string;
  client: PoolClient;
}): Promise<User> => {
  const { userProfile, organisationId, client } = params;

  const userFromDb = await getUserIfMapped({
    userProfileId: userProfile.id,
    client: params.client,
  });

  if (userFromDb) {
    return userFromDb;
  }

  const user = userProfileToUser({
    userProfile,
    organisationId: organisationId,
    status: "to_be_invited",
    correlationQuality:
      userProfile.matchQuality === "exact" ? "full" : "partial",
  });

  return insertNewUser({ toInsert: user, client });
};

const isFastifyError = (error: unknown): error is FastifyError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "statusCode" in error
  );
};

const processOrganizationUserRelation = async (params: {
  userId: string;
  client: PoolClient;
  organisationId: string;
}): Promise<OrganisationUserConfig> => {
  let orgUserRelation = undefined;
  try {
    orgUserRelation = await getUserOrganisationRelation(params);
  } catch (error) {
    const nativeError = isFastifyError(error) ? error : null;
    if (
      nativeError === null ||
      !nativeError.message.endsWith(USER_ORGANIZATION_RELATION_MISSING_ERROR)
    ) {
      throw error;
    }
  }

  if (orgUserRelation) {
    return orgUserRelation;
  }
  return insertNewOrganizationUserRelation({
    toInsert: {
      invitationFeedbackAt: null,
      invitationSentAt: null,
      invitationStatus: "to_be_invited",
      organisationId: params.organisationId,
      userId: params.userId,
      preferredTransports: [],
    },
    client: params.client,
  });
};

const processToImportUser = async (params: {
  profile: Profile;
  toImportUser: ToImportUser;
  organisationId: string;
  client: PoolClient;
}): Promise<{
  user?: User;
  organisationUser?: OrganisationUserConfig;
  importedUser: ToImportUser;
}> => {
  const response = await getUserProfile(params);
  const userProfile = response.data;
  if (!userProfile) {
    // User profile not found, cannot map
    params.toImportUser.importStatus = "not_found";
    return { importedUser: params.toImportUser };
  }

  const user = await processUser({
    userProfile,
    organisationId: params.organisationId,
    client: params.client,
  });

  if (!user.id) {
    throw createError(
      IMPORT_USERS_ERROR,
      "Error inserting the user in the db",
      500,
    )();
  }

  const organisationUser = await processOrganizationUserRelation({
    client: params.client,
    userId: user.id,
    organisationId: params.organisationId,
  });

  await processTagsPerUser({
    userId: user.id,
    client: params.client,
    tags: params.toImportUser.tags ?? [],
  });

  params.toImportUser.importStatus = "imported";
  params.toImportUser.relatedUserProfileId = userProfile.id;

  return { user, organisationUser, importedUser: params.toImportUser };
};

const insertNewUser = async (params: {
  toInsert: User;
  client: PoolClient;
}): Promise<User> => {
  try {
    const { toInsert, client } = params;
    const result = await client.query<{ id: string }>(
      `
            INSERT INTO users
                (user_profile_id, importer_organisation_id, user_status, correlation_quality)
            VALUES( $1, $2, $3, $4) RETURNING id as "id";
        `,
      [
        toInsert.userProfileId,
        toInsert.importerOrganisationId,
        toInsert.userStatus,
        toInsert.correlationQuality,
      ],
    );
    toInsert.id = result.rows[0].id;

    return toInsert;
  } catch (error) {
    const message = isNativeError(error) ? error.message : "unknown error";
    const toOutput = createError(
      IMPORT_USERS_ERROR,
      `Error inserting new user: ${message}`,
      500,
    )();

    throw toOutput;
  }
};

const USER_ORGANIZATION_RELATION_MISSING_ERROR =
  "The relation between the user and the organisation doesn't exist";

const getUserOrganisationRelation = async (params: {
  userId: string;
  organisationId: string;
  client: PoolClient;
}): Promise<OrganisationUserConfig> => {
  try {
    const result = await params.client.query<OrganisationUserConfig>(
      `
          select 
              user_id as "userId",
              organisation_id as "organisationId",
              invitation_status as "invitationStatus",
              invitation_sent_at as "invitationSentAt",
              invitation_feedback_at as "invitationFeedbackAt",
              preferred_transports as "preferredTransports"
          from organisation_user_configurations where user_id = $1 and organisation_id = $2 limit 1
        `,
      [params.userId, params.organisationId],
    );

    if (result.rowCount === 0) {
      throw new Error(USER_ORGANIZATION_RELATION_MISSING_ERROR);
    }

    return result.rows[0];
  } catch (error) {
    const message = isNativeError(error) ? error.message : "unknown error";
    const toOutput = createError(
      IMPORT_USERS_ERROR,
      `Error retrieving organisation user relation: ${message}`,
      500,
    )();

    throw toOutput;
  }
};

const insertNewOrganizationUserRelation = async (params: {
  toInsert: OrganisationUserConfig;
  client: PoolClient;
}): Promise<OrganisationUserConfig> => {
  try {
    const { toInsert, client } = params;
    await client.query(
      `
        INSERT INTO organisation_user_configurations
          (organisation_id, user_id, invitation_status, invitation_sent_at, invitation_feedback_at, preferred_transports)
        VALUES($1, $2, $3, $4, $5, $6);
      `,
      [
        toInsert.organisationId,
        toInsert.userId,
        toInsert.invitationStatus,
        toInsert.invitationSentAt,
        toInsert.invitationFeedbackAt,
        toInsert.preferredTransports,
      ],
    );

    return toInsert;
  } catch (error) {
    const message = isNativeError(error) ? error.message : "unknown error";
    const toOutput = createError(
      IMPORT_USERS_ERROR,
      `Error inserting new organization user relation: ${message}`,
      500,
    )();

    throw toOutput;
  }
};

const getUserIfMapped = async (params: {
  userProfileId: string;
  client: PoolClient;
}): Promise<User | undefined> => {
  try {
    const result = await params.client.query<User>(
      `
        SELECT 
            id as "id",
            user_profile_id as "userProfileId",
            importer_organisation_id as "importerOrganisationId",
            user_status as "userStatus",
            correlation_quality as "correlationQuality"    
        FROM users where user_profile_id = $1 LIMIT 1
      `,
      [params.userProfileId],
    );

    if (result.rowCount === 0) {
      return undefined;
    }

    return result.rows[0];
  } catch (error) {
    const message = isNativeError(error) ? error.message : "unknown error";
    const toOutput = createError(
      IMPORT_USERS_ERROR,
      `Error retrieving user by user profile id: ${message}`,
      500,
    )();

    throw toOutput;
  }
};

const userProfileToUser = (params: {
  userProfile: FoundUser;
  userId?: string;
  organisationId: string;
  status?: UserStatus;
  correlationQuality?: CorrelationQuality;
}): User => ({
  id: params.userId,
  importerOrganisationId: params.organisationId,
  userProfileId: params.userProfile.id,
  userStatus: params.status ?? "pending",
  correlationQuality: params.correlationQuality ?? "full",
});

const getUserProfile = async (params: {
  profile: Profile;
  toImportUser: ToImportUser;
}): Promise<{ data: FoundUser | undefined }> => {
  const { profile, toImportUser } = params;

  return profile.findUser({
    ppsn: toImportUser.publicIdentityId ?? undefined,
    firstname: toImportUser.firstName ?? undefined,
    lastname: toImportUser.lastName ?? undefined,
    dateOfBirth: toImportUser.birthDate ?? undefined,
    email: toImportUser.emailAddress ?? undefined,
    phone: toImportUser.phoneNumber ?? undefined,
  });
};
