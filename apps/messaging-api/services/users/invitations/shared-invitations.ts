import { PoolClient } from "pg";
import { isNativeError } from "util/types";
import {
  OrganisationInvitationFeedback,
  UserInvitation,
} from "../../../types/usersSchemaDefinitions";
import { utils } from "../../../utils";
import { ServerError } from "shared-errors";
import { Omit } from "@sinclair/typebox";

type MandatoryProfileIdInvitation = Omit<UserInvitation, "userProfileId"> & {
  userProfileId: string;
};

export const getUsersInvitationsForOrganisation = async (params: {
  userProfileIds: string[];
  organisationId: string;
  client: PoolClient;
  errorCode: string;
}): Promise<MandatoryProfileIdInvitation[]> => {
  try {
    let userIndex = 2;
    const idsIndexes = params.userProfileIds.map(() => `$${userIndex++}`);
    const result = await params.client.query<MandatoryProfileIdInvitation>(
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
    throw new ServerError(
      params.errorCode,
      `Error retrieving user invitations: ${message}`,
    );
  }
};

export const getUserInvitations = async (params: {
  userProfileId: string;
  client: PoolClient;
  errorCode: string;
}): Promise<UserInvitation[]> => {
  try {
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
              right join organisation_user_configurations ouc on ouc.user_id = u.id
                  where u.user_profile_id = $1
          `,
      [params.userProfileId],
    );

    return result.rows;
  } catch (error) {
    const message = isNativeError(error) ? error.message : "unknown error";
    throw new ServerError(
      params.errorCode,
      `Error retrieving user invitations: ${message}`,
    );
  }
};

export const executeUpdateOrganisationFeedback = async (params: {
  client: PoolClient;
  feedback: OrganisationInvitationFeedback;
  organisationId: string;
  userId: string;
  errorCode: string;
}): Promise<void> => {
  try {
    const { feedback } = params;
    await params.client.query(
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
    throw new ServerError(
      params.errorCode,
      `Error on invitation feedback: ${message}`,
    );
  }
};
