import { PostgresDb } from "@fastify/postgres";
import { getSettingsPerUser, getUserByUserProfileId } from "../shared-users.js";
import { executeUpdateOrganisationFeedback } from "./shared-invitations.js";
import {
  InvitationFeedback,
  OrganisationInvitationFeedback,
  OrganisationSetting,
  User,
} from "../../../types/usersSchemaDefinitions.js";
import { PoolClient, QueryResult } from "pg";
import { isNativeError } from "util/types";
import { httpErrors } from "@fastify/sensible";

export const getOrganisationSettingsForProfile = async (params: {
  pg: PostgresDb;
  userProfileId: string;
  organisationSettingId: string;
}): Promise<OrganisationSetting> => {
  const { pg, userProfileId, organisationSettingId } = params;
  const client = await pg.connect();
  try {
    return await getSettingPerProfileId({
      client,
      userProfileId,
      organisationSettingId,
    });
  } finally {
    client.release();
  }
};

const getSettingPerProfileId = async (params: {
  client: PoolClient;
  userProfileId: string;
  organisationSettingId: string;
}): Promise<OrganisationSetting> => {
  const { client, userProfileId, organisationSettingId } = params;
  const user = await getUserByUserProfileId({
    client,
    userProfileId,
  });
  if (!user.userProfileId) {
    throw httpErrors.badRequest("The current user has no related user profile");
  }
  const invitations = await getSettingsPerUser({
    userId: user.id,
    client,
    organisationSettingId,
  });

  if (invitations.data.length === 0) {
    throw httpErrors.notFound("Organisation setting not found");
  }

  return invitations.data[0];
};

const ensureUserIsActive = (userInvitation: OrganisationSetting): void => {
  if (userInvitation.userStatus !== "active") {
    throw httpErrors.badRequest(
      "A user must be active before accepting invitation from an organisation",
    );
  }
};

export const updateOrganisationFeedback = async (params: {
  pg: PostgresDb;
  feedback: OrganisationInvitationFeedback;
  organisationSettingId: string;
  userProfileId: string;
}): Promise<OrganisationSetting> => {
  const client = await params.pg.connect();
  try {
    const userInvitation = await getSettingPerProfileId({ client, ...params });
    ensureUserIsActive(userInvitation);

    if (
      params.feedback.preferredTransports.length === 0 &&
      params.feedback.invitationStatusFeedback === "accepted"
    ) {
      throw httpErrors.badRequest(
        "At least one preferred transport must be selected",
      );
    }

    await executeUpdateOrganisationFeedback({
      client,
      ...params,
      userId: userInvitation.userId,
    });

    return await getSettingPerProfileId({ client, ...params });
  } finally {
    client.release();
  }
};

export const updateInvitationStatus = async (params: {
  pg: PostgresDb;
  feedback: InvitationFeedback;
  userProfileId: string;
}): Promise<User> => {
  const client = await params.pg.connect();
  try {
    // invoking this will check if the user exists
    await getUserByUserProfileId({
      client,
      userProfileId: params.userProfileId,
    });

    return await executeUpdateUserStatus({ client, ...params });
  } finally {
    client.release();
  }
};

export const getInvitationStatus = async (params: {
  pg: PostgresDb;
  userProfileId: string;
}): Promise<{ userStatus: string }> => {
  const client = await params.pg.pool.connect();
  let statusResponse: QueryResult;

  try {
    statusResponse = await client.query<{ userStatus: string }>(
      `
          SELECT user_status as "userStatus" from users
          WHERE user_profile_id = $1 
          LIMIT 1
        `,
      [params.userProfileId],
    );
  } catch (error) {
    const message = isNativeError(error) ? error.message : "unknown error";
    throw httpErrors.internalServerError(
      `Error on invitation feedback: ${message}`,
    );
  } finally {
    client.release();
  }

  if (!statusResponse || statusResponse.rowCount === 0) {
    throw httpErrors.notFound("Cannot find accepted invitations for the user");
  }

  return statusResponse.rows[0];
};

const executeUpdateUserStatus = async (params: {
  client: PoolClient;
  feedback: InvitationFeedback;
  userProfileId: string;
}): Promise<User> => {
  let users: QueryResult<User>;
  try {
    const { feedback } = params;
    users = await params.client.query<User>(
      `
        UPDATE users
        SET user_status = $1
        WHERE user_profile_id = $2 RETURNING
          id as "id",
          user_profile_id as "userProfileId",
          importer_organisation_id as "importerOrganisationId",
          user_status as "userStatus",
          correlation_quality as "correlationQuality"
      `,
      [feedback.userStatusFeedback, params.userProfileId],
    );
  } catch (error) {
    const message = isNativeError(error) ? error.message : "unknown error";
    throw httpErrors.internalServerError(
      `Error on invitation feedback: ${message}`,
    );
  }

  if (users.rowCount === 0) {
    throw httpErrors.internalServerError("Cannot update this user");
  }

  return users.rows[0];
};
