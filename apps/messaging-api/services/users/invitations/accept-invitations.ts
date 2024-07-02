import { PostgresDb } from "@fastify/postgres";
import { getUserByUserProfileId } from "../shared-users";
import {
  executeUpdateOrganisationFeedback,
  getUserInvitations,
  getUsersInvitationsForOrganisation,
} from "./shared-invitations";
import {
  InvitationFeedback,
  OrganisationInvitationFeedback,
  User,
  UserInvitation,
} from "../../../types/usersSchemaDefinitions";
import { PoolClient, QueryResult } from "pg";
import { isNativeError } from "util/types";
import { BadRequestError, NotFoundError, ServerError } from "shared-errors";

const ACCEPT_INVITATIONS_ERROR = "ACCEPT_INVITATIONS_ERROR";

export const getInvitationForUser = async (params: {
  pg: PostgresDb;
  userProfileId: string;
  organisationId: string;
}): Promise<UserInvitation> => {
  const { pg, userProfileId, organisationId } = params;
  const client = await pg.connect();
  try {
    return await getInvitation({ client, userProfileId, organisationId });
  } finally {
    client.release();
  }
};

export const getInvitationsForUser = async (params: {
  pg: PostgresDb;
  userProfileId: string;
}): Promise<UserInvitation[]> => {
  const { pg, userProfileId } = params;
  const client = await pg.connect();
  try {
    await getUserByUserProfileId({
      client,
      userProfileId,
      errorCode: ACCEPT_INVITATIONS_ERROR,
    });

    return await getUserInvitations({
      userProfileId,
      client,
      errorCode: ACCEPT_INVITATIONS_ERROR,
    });
  } finally {
    client.release();
  }
};

const getInvitation = async (params: {
  client: PoolClient;
  userProfileId: string;
  organisationId: string;
}): Promise<UserInvitation> => {
  const { client, userProfileId, organisationId } = params;
  const user = await getUserByUserProfileId({
    client,
    userProfileId,
    errorCode: ACCEPT_INVITATIONS_ERROR,
  });
  if (!user.userProfileId) {
    throw new BadRequestError(
      ACCEPT_INVITATIONS_ERROR,
      "The current user has no related user profile",
    );
  }
  const invitations = await getUsersInvitationsForOrganisation({
    userProfileIds: [user.userProfileId],
    organisationId,
    client,
    errorCode: ACCEPT_INVITATIONS_ERROR,
  });

  if (invitations.length === 0) {
    throw new BadRequestError(
      ACCEPT_INVITATIONS_ERROR,
      "This user has no related invitations",
    );
  }

  return invitations[0];
};

const ensureUserIsActive = (userInvitation: UserInvitation): void => {
  if (userInvitation.userStatus !== "active") {
    throw new BadRequestError(
      ACCEPT_INVITATIONS_ERROR,
      "A user must be active before accepting invitation from an organisation",
    );
  }
};

export const updateOrganisationFeedback = async (params: {
  pg: PostgresDb;
  feedback: OrganisationInvitationFeedback;
  organisationId: string;
  userProfileId: string;
}): Promise<UserInvitation> => {
  const client = await params.pg.connect();
  try {
    const userInvitation = await getInvitation({ client, ...params });
    ensureUserIsActive(userInvitation);

    if (
      params.feedback.preferredTransports.length === 0 &&
      params.feedback.invitationStatusFeedback === "accepted"
    ) {
      throw new BadRequestError(
        ACCEPT_INVITATIONS_ERROR,
        "At least one preferred transport must be selected",
      );
    }

    await executeUpdateOrganisationFeedback({
      client,
      ...params,
      userId: userInvitation.id,
      errorCode: ACCEPT_INVITATIONS_ERROR,
    });

    return await getInvitation({ client, ...params });
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
      errorCode: ACCEPT_INVITATIONS_ERROR,
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
    throw new ServerError(
      ACCEPT_INVITATIONS_ERROR,
      `Error on invitation feedback: ${message}`,
    );
  } finally {
    client.release();
  }

  if (!statusResponse || statusResponse.rowCount === 0) {
    throw new NotFoundError(ACCEPT_INVITATIONS_ERROR, "Cannot find the user");
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
    throw new ServerError(
      ACCEPT_INVITATIONS_ERROR,
      `Error on invitation feedback: ${message}`,
    );
  }

  if (users.rowCount === 0) {
    throw new ServerError(ACCEPT_INVITATIONS_ERROR, "Cannot update this user");
  }

  return users.rows[0];
};
