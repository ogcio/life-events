import { createError } from "@fastify/error";
import { PoolClient } from "pg";
import { isNativeError } from "util/types";
import { UserInvitation } from "../../../types/usersSchemaDefinitions";

export const getUserInvitations = async (params: {
  userProfileIds: string[];
  organisationId: string;
  client: PoolClient;
  errorCode: string;
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
              right join organisation_user_configurations ouc on ouc.user_id = u.id and ouc.organisation_id = $1
                  where u.user_profile_id in (${idsIndexes.join(", ")})
          `,
      [params.organisationId, ...params.userProfileIds],
    );

    return result.rows;
  } catch (error) {
    const message = isNativeError(error) ? error.message : "unknown error";
    const toOutput = createError(
      params.errorCode,
      `Error retrieving user invitations: ${message}`,
      500,
    )();

    throw toOutput;
  }
};
