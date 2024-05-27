import { FastifyBaseLogger } from "fastify";
import { createError } from "@fastify/error";
import { Pool, PoolClient } from "pg";
import {
  UserInvitation,
  UsersImport,
} from "../../../types/usersSchemaDefinitions";
import { isNativeError } from "util/types";

const SEND_INVITATIONS_ERROR = "SEND_INVITATIONS_ERROR";

export const sendInvitationsForUsersImport = async (params: {
  pool: Pool;
  logger: FastifyBaseLogger;
  toImportUsers: UsersImport;
}): Promise<void> => {
  const { pool, toImportUsers } = params;
  const importedUserProfileIds = toImportUsers.usersData
    .filter((ud) => ud.relatedUserProfileId)
    .map((ud) => ud.relatedUserProfileId) as string[];

  if (importedUserProfileIds.length === 0) {
    return;
  }

  const client = await pool.connect();
  try {
    const userInvitations = await getUserInvitations({
      userProfileIds: importedUserProfileIds,
      organisationId: toImportUsers.organisationId,
      client,
    });
  } finally {
    client.release();
  }
};

const prepareInvitations = (params: { userInvitations: UserInvitation[] }) => {
  for (const toInvite of params.userInvitations) {
    if (toInvite.userStatus === "to_be_invited") {
      // send invitation to messaging

      //if we send invitation to platform we don't send another email for organisation
      continue;
    }

    if (toInvite.organisationInvitationStatus === "to_be_invited") {
      // send invitation to accept comunication from org
    }
  }
};

const getUserInvitations = async (params: {
  userProfileIds: string[];
  organisationId: string;
  client: PoolClient;
}): Promise<UserInvitation[]> => {
  try {
    let userIndex = 2;
    const idsIndexes = params.userProfileIds.map(() => `$${userIndex++}`);
    const result = await params.client.query<UserInvitation>(
      `
            select
                ouc.user_id as "id",
                u.user_profile_id as "userProfileId",
                ouc.organisation_id as "organisationId",
                ouc.invitation_status as "organisationInvitationStatus",
                ouc.invitation_sent_at  as "organisationInvitationSentAt",
                ouc.invitation_feedback_at as "organisationInvitationFeedbackAt",
                ouc.preferred_transports as "organisationPreferredTransports",
                u.correlation_quality as "correlationQuality",
                u.user_status as "userStatus"
            from users u
            left join organisation_user_configurations ouc on ouc.user_id = u.id and ouc.organisation_id = $1
                where u.user_profile_id in (${idsIndexes.join(", ")})
        `,
      [params.organisationId, ...params.userProfileIds],
    );

    return result.rows;
  } catch (error) {
    const message = isNativeError(error) ? error.message : "unknown error";
    const toOutput = createError(
      SEND_INVITATIONS_ERROR,
      `Error retrieving user invitations: ${message}`,
      500,
    )();

    throw toOutput;
  }
};
