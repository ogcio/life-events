import { createError } from "@fastify/error";
import { PostgresDb } from "@fastify/postgres";
import { getUserById } from "../shared-users";
import { getUserInvitations } from "./shared-invitations";
import {
  InvitationFeedback,
  OrganisationInvitationFeedback,
  User,
  UserInvitation,
} from "../../../types/usersSchemaDefinitions";
import { PoolClient, QueryResult } from "pg";
import { isNativeError } from "util/types";
import { utils } from "../../../utils";

const ACCEPT_INVITATIONS_ERROR = "ACCEPT_INVITATIONS_ERROR";

export const getInvitationForUser = async (params: {
  pg: PostgresDb;
  userId: string;
  organisationId: string;
}): Promise<UserInvitation> => {
  const { pg, userId, organisationId } = params;
  const client = await pg.connect();
  try {
    return await getInvitation({ client, userId, organisationId });
  } finally {
    client.release();
  }
};

const getInvitation = async (params: {
  client: PoolClient;
  userId: string;
  organisationId: string;
}): Promise<UserInvitation> => {
  const { client, userId, organisationId } = params;
  const user = await getUserById({
    client,
    userId,
    errorCode: ACCEPT_INVITATIONS_ERROR,
  });
  if (!user.userProfileId) {
    throw createError(
      ACCEPT_INVITATIONS_ERROR,
      "The current user has no related user profile",
      400,
    )();
  }
  const invitations = await getUserInvitations({
    userProfileIds: [user.userProfileId],
    organisationId,
    client,
    errorCode: ACCEPT_INVITATIONS_ERROR,
  });

  if (invitations.length === 0) {
    throw createError(
      ACCEPT_INVITATIONS_ERROR,
      "This user has no related invitations",
      400,
    )();
  }

  return invitations[0];
};

const ensureUserIsActive = (userInvitation: UserInvitation): void => {
  if (userInvitation.userStatus !== "active") {
    throw createError(
      ACCEPT_INVITATIONS_ERROR,
      "A user must be active before accepting invitation from an organisation",
      400,
    )();
  }
};

export const updateOrganisationFeedback = async (params: {
  pg: PostgresDb;
  feedback: OrganisationInvitationFeedback;
  organisationId: string;
  userId: string;
}): Promise<UserInvitation> => {
  const client = await params.pg.connect();
  try {
    const userInvitation = await getInvitation({ client, ...params });
    ensureUserIsActive(userInvitation);

    if (params.feedback.preferredTransports.length === 0) {
      throw createError(
        ACCEPT_INVITATIONS_ERROR,
        "At least one preferred transport must be selected",
      )();
    }

    await executeUpdateOrganisationFeedback({ client, ...params });

    return await getInvitation({ client, ...params });
  } finally {
    client.release();
  }
};

const executeUpdateOrganisationFeedback = async (params: {
  client: PoolClient;
  feedback: OrganisationInvitationFeedback;
  organisationId: string;
  userId: string;
}): Promise<void> => {
  try {
    const { feedback } = params;
    await params.client.query<UserInvitation>(
      `
        UPDATE organisation_user_configurations
        SET invitation_status=$1::text, invitation_feedback_at = $2, preferred_transports = $3
        WHERE organisation_id = $4 and user_id = $5
      `,
      [
        feedback.invitationStatusFeedback,
        new Date().toISOString(),
        utils.postgresArrayify(feedback.preferredTransports),
        params.organisationId,
        params.userId,
      ],
    );
  } catch (error) {
    const message = isNativeError(error) ? error.message : "unknown error";
    const toOutput = createError(
      ACCEPT_INVITATIONS_ERROR,
      `Error on invitation feedback: ${message}`,
      500,
    )();

    throw toOutput;
  }
};

export const updateInvitationStatus = async (params: {
  pg: PostgresDb;
  feedback: InvitationFeedback;
  userId: string;
}): Promise<User> => {
  const client = await params.pg.connect();
  try {
    // invoking this will check if the user exists
    await getUserById({
      client,
      errorCode: ACCEPT_INVITATIONS_ERROR,
      userId: params.userId,
    });

    return await executeUpdateUserStatus({ client, ...params });
  } finally {
    client.release();
  }
};

const executeUpdateUserStatus = async (params: {
  client: PoolClient;
  feedback: InvitationFeedback;
  userId: string;
}): Promise<User> => {
  let users: QueryResult<User>;
  try {
    const { feedback } = params;
    users = await params.client.query<User>(
      `
        UPDATE users
        SET user_status=$1::text
        WHERE user_id = $2 RETURNING
          id as "id",
          user_profile_id as "userProfileId",
          importer_organisation_id as "importerOrganisationId",
          user_status as "userStatus",
          correlation_quality as "correlationQuality"  
      `,
      [feedback.userStatusFeedback, params.userId],
    );
  } catch (error) {
    const message = isNativeError(error) ? error.message : "unknown error";
    const toOutput = createError(
      ACCEPT_INVITATIONS_ERROR,
      `Error on invitation feedback: ${message}`,
      500,
    )();

    throw toOutput;
  }

  if (users.rowCount === 0) {
    throw createError(
      ACCEPT_INVITATIONS_ERROR,
      "Cannot update this user",
      500,
    )();
  }

  return users.rows[0];
};
