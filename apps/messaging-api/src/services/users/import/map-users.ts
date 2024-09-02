import { FastifyBaseLogger } from "fastify";
import { PoolClient } from "pg";
import {
  CorrelationQuality,
  OrganisationUserConfig,
  ToImportUser,
  User,
  UserDetails,
  UserStatus,
  UsersImport,
} from "../../../types/usersSchemaDefinitions.js";
import { isNativeError } from "util/types";
import { Profile } from "building-blocks-sdk";
import { IMPORT_USERS_ERROR } from "./import-users.js";
import {
  AvailableTransports,
  getUserByContacts,
  getUserByUserProfileId,
  getUserImports,
} from "../shared-users.js";
import { processTagsPerUser } from "../../tags/manage-tags.js";
import { executeUpdateOrganisationFeedback } from "../invitations/shared-invitations.js";
import {
  NotFoundError,
  NotImplementedError,
  ServerError,
  isLifeEventsError,
} from "shared-errors";
import { getProfileSdk } from "../../../utils/authentication-factory.js";
import { EditableProviderTypes } from "../../../types/schemaDefinitions.js";

interface FoundUser {
  id: string;
  firstname: string;
  lastname: string;
  matchQuality: "exact" | "approximate";
}

interface RequestUser {
  userId: string;
  organizationId?: string;
  accessToken: string;
}

export const mapUsers = async (params: {
  importId: string;
  client: PoolClient;
  logger: FastifyBaseLogger;
  requestUser: RequestUser;
}): Promise<UsersImport> => {
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
}): Promise<UsersImport> => {
  // Here we will invoke the scheduler
  throw new NotImplementedError(
    IMPORT_USERS_ERROR,
    "async users mapping not yet implemented, change the SYNCHRONOUS_USER_IMPORT key to true",
  );
};

const mapUsersSync = async (params: {
  importId: string;
  client: PoolClient;
  logger: FastifyBaseLogger;
  requestUser: RequestUser;
}): Promise<UsersImport> => {
  const usersImport = await getUsersImport(params);
  const profile = await getProfileSdk(params.requestUser.organizationId);

  const processingUsers = usersImport.usersData.map(
    async (toImportUser: ToImportUser) =>
      await processToImportUser({
        profile,
        toImportUser,
        organisationId: usersImport.organisationId,
        client: params.client,
        usersImportId: params.importId,
      }),
  );

  const processedUsers = await Promise.all(processingUsers);

  usersImport.usersData = processedUsers.map((user) => user.importedUser);
  usersImport.retryCount += 1;
  usersImport.lastRetryAt = new Date().toISOString();

  return updateUsersImport({ client: params.client, usersImport });
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
        usersImport.id,
      ],
    );

    return usersImport;
  } catch (error) {
    const message = isNativeError(error) ? error.message : "unknown error";
    throw new ServerError(
      IMPORT_USERS_ERROR,
      `Error during updating users import on db: ${message}`,
    );
  }
};

const getUsersImport = async (params: {
  importId: string;
  client: PoolClient;
  logger: FastifyBaseLogger;
}): Promise<UsersImport> => {
  const results = await getUserImports({
    client: params.client,
    whereClauses: ["import_id = $1"],
    whereValues: [params.importId],
    limit: 1,
    errorCode: IMPORT_USERS_ERROR,
    includeUsersData: true,
  });

  if (results.length === 0) {
    throw new NotFoundError(
      IMPORT_USERS_ERROR,
      `Users import with id ${params.importId} not found`,
    );
  }

  return results[0];
};

const processUser = async (params: {
  userProfile: FoundUser | undefined;
  organisationId: string;
  client: PoolClient;
  toImportUser: ToImportUser;
  usersImportId: string;
}): Promise<User> => {
  const { userProfile, organisationId, client, toImportUser, usersImportId } =
    params;

  if (userProfile) {
    const userFromDb = await getUserIfMapped({
      userProfileId: userProfile.id,
      client: params.client,
    });

    if (userFromDb) {
      return userFromDb;
    }
  }

  if (toImportUser.emailAddress || toImportUser.phoneNumber) {
    const userFromDb = await getUserByContactsIfMapped({
      phone: toImportUser.phoneNumber,
      email: toImportUser.emailAddress,
      client: params.client,
    });

    if (userFromDb) {
      return userFromDb;
    }
  }
  const correlationQuality: CorrelationQuality = userProfile
    ? userProfile.matchQuality === "exact"
      ? "full"
      : "partial"
    : "not_related";

  const user = fillUser({
    userProfileId: userProfile?.id ?? null,
    organisationId: organisationId,
    status: params.toImportUser.collectedConsent ? "active" : "to_be_invited",
    correlationQuality,
    toImportUser,
    usersImportId,
  });

  return insertNewUser({ toInsert: user, client });
};

const processOrganizationUserRelation = async (params: {
  userId: string;
  client: PoolClient;
  organisationId: string;
  consentGranted: boolean;
}): Promise<OrganisationUserConfig> => {
  let orgUserRelation = undefined;
  try {
    orgUserRelation = await getUserOrganisationRelation(params);
  } catch (error) {
    if (!isLifeEventsError(error) || error.errorCode !== 404) {
      throw error;
    }
  }

  let toSetStatus: "accepted" | "to_be_invited" = "to_be_invited";
  let toSetTransports: EditableProviderTypes[] = [];
  if (params.consentGranted) {
    toSetStatus = "accepted";
    toSetTransports = [AvailableTransports.EMAIL, AvailableTransports.SMS];
  }

  if (orgUserRelation) {
    // means that this user was already imported
    if (
      orgUserRelation.invitationStatus === "to_be_invited" &&
      toSetStatus === "accepted"
    ) {
      await executeUpdateOrganisationFeedback({
        client: params.client,
        feedback: {
          preferredTransports: toSetTransports,
          invitationStatusFeedback: toSetStatus,
        },
        organisationSettingId: orgUserRelation.id,
        userId: params.userId,
        errorCode: IMPORT_USERS_ERROR,
      });
      return await getUserOrganisationRelation(params);
    }
    return orgUserRelation;
  }

  return insertNewOrganizationUserRelation({
    toInsert: {
      invitationFeedbackAt: params.consentGranted
        ? new Date().toISOString()
        : null,
      invitationSentAt: null,
      invitationStatus: toSetStatus,
      organisationId: params.organisationId,
      userId: params.userId,
      preferredTransports: toSetTransports,
    },
    client: params.client,
  });
};

const processToImportUser = async (params: {
  profile: Profile;
  toImportUser: ToImportUser;
  organisationId: string;
  client: PoolClient;
  usersImportId: string;
}): Promise<{
  user?: User;
  organisationUser?: OrganisationUserConfig;
  importedUser: ToImportUser;
}> => {
  const { toImportUser, organisationId, client, usersImportId } = params;
  const response = await getUserProfile(params);
  const userProfile = response.data;
  if (!userProfile) {
    if (!toImportUser.emailAddress && !toImportUser.phoneNumber) {
      toImportUser.importStatus = "missing_contacts";
      return { importedUser: toImportUser };
    }

    toImportUser.importStatus = "not_found";
  }

  const user = await processUser({
    userProfile,
    organisationId,
    client,
    toImportUser,
    usersImportId,
  });

  if (!user.id) {
    throw new ServerError(
      IMPORT_USERS_ERROR,
      "Error inserting the user in the db",
    );
  }

  const organisationUser = await processOrganizationUserRelation({
    client,
    userId: user.id,
    organisationId,
    consentGranted: toImportUser.collectedConsent,
  });

  await processTagsPerUser({
    userId: user.id,
    client,
    tags: params.toImportUser.tags ?? [],
  });

  toImportUser.importStatus = "imported";
  toImportUser.relatedUserProfileId = userProfile?.id;
  toImportUser.relatedUserId = user.id;

  return { user, organisationUser, importedUser: params.toImportUser };
};

const insertNewUser = async (params: {
  toInsert: Omit<User, "id">;
  client: PoolClient;
}): Promise<User> => {
  try {
    const { toInsert, client } = params;
    const result = await client.query<{ id: string }>(
      `
            INSERT INTO users
                (
                  user_profile_id,
                  importer_organisation_id,
                  user_status,
                  correlation_quality,
                  email,
                  phone,
                  users_import_id,
                  details
                )
            VALUES( $1, $2, $3, $4, $5, $6, $7, $8) RETURNING id as "id";
        `,
      [
        toInsert.userProfileId,
        toInsert.importerOrganisationId,
        toInsert.userStatus,
        toInsert.correlationQuality,
        toInsert.email,
        toInsert.phone,
        toInsert.usersImportId,
        toInsert.details ? JSON.stringify(toInsert.details) : "{}",
      ],
    );
    return { ...toInsert, id: result.rows[0].id };
  } catch (error) {
    const message = isNativeError(error) ? error.message : "unknown error";
    throw new ServerError(
      IMPORT_USERS_ERROR,
      `Error inserting new user: ${message}`,
    );
  }
};

const USER_ORGANIZATION_RELATION_MISSING_ERROR =
  "The relation between the user and the organisation doesn't exist";

const getUserOrganisationRelation = async (params: {
  userId: string;
  organisationId: string;
  client: PoolClient;
}): Promise<Omit<OrganisationUserConfig, "id"> & { id: string }> => {
  try {
    const result = await params.client.query<
      Omit<OrganisationUserConfig, "id"> & { id: string }
    >(
      `
          select
              id as "id", 
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
      throw new NotFoundError(
        IMPORT_USERS_ERROR,
        USER_ORGANIZATION_RELATION_MISSING_ERROR,
      );
    }

    return result.rows[0];
  } catch (error) {
    if (isLifeEventsError(error) && error.errorCode === 404) {
      throw error;
    }
    const message = isNativeError(error) ? error.message : "unknown error";
    throw new ServerError(
      IMPORT_USERS_ERROR,
      `Error retrieving organisation user relation: ${message}`,
    );
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
    throw new ServerError(
      IMPORT_USERS_ERROR,
      `Error inserting new organization user relation: ${message}`,
    );
  }
};

const getUserIfMapped = async (params: {
  userProfileId: string;
  client: PoolClient;
}): Promise<User | undefined> => {
  const { userProfileId, client } = params;
  try {
    return await getUserByUserProfileId({
      userProfileId,
      client,
      errorCode: IMPORT_USERS_ERROR,
    });
  } catch (error) {
    if (isLifeEventsError(error) && error.errorCode === 404) {
      return undefined;
    }

    throw error;
  }
};

const getUserByContactsIfMapped = async (params: {
  email: string | null;
  phone: string | null;
  client: PoolClient;
}): Promise<User | undefined> => {
  const { email, phone, client } = params;
  try {
    return await getUserByContacts({
      email,
      phone,
      client,
      errorCode: IMPORT_USERS_ERROR,
    });
  } catch (error) {
    if (isLifeEventsError(error) && error.errorCode === 404) {
      return undefined;
    }

    throw error;
  }
};

const fillUser = (params: {
  userProfileId: string | null;
  userId?: string;
  organisationId: string;
  status?: UserStatus;
  correlationQuality?: CorrelationQuality;
  toImportUser: ToImportUser;
  usersImportId: string;
}): Omit<User, "id"> & { id?: string } => ({
  id: params.userId,
  importerOrganisationId: params.organisationId,
  userProfileId: params.userProfileId,
  userStatus: params.status ?? "pending",
  correlationQuality: params.correlationQuality ?? "full",
  phone: params.toImportUser.phoneNumber,
  email: params.toImportUser.emailAddress,
  details: extractUserDetails(params.toImportUser),
  usersImportId: params.usersImportId,
});

const extractUserDetails = (toImportUser: ToImportUser): UserDetails => ({
  publicIdentityId: toImportUser.publicIdentityId,
  firstName: toImportUser.firstName,
  lastName: toImportUser.lastName,
  birthDate: toImportUser.birthDate,
  address: toImportUser.address,
  collectedConsent: toImportUser.collectedConsent,
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
