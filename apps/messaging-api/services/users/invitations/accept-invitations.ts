import { createError } from "@fastify/error";
import { PostgresDb } from "@fastify/postgres";
import { getUserById } from "../shared-users";
import { getUserInvitations } from "./shared-invitations";

const ACCEPT_INVITATIONS_ERROR = "ACCEPT_INVITATIONS_ERROR";

export const getInvitationForUser = async (params: {
  pg: PostgresDb;
  userId: string;
  organisationId: string;
}) => {
  const { pg, userId, organisationId } = params;
  const client = await pg.connect();
  try {
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
        "This user has no pending invitations",
        400,
      )();
    }

    return invitations[0];
  } finally {
    client.release();
  }
};
