import { PoolClient } from "pg";
import { isNativeError } from "util/types";
import { OrganisationInvitationFeedback } from "../../../types/usersSchemaDefinitions.js";
import { utils } from "../../../utils.js";
import { ServerError } from "shared-errors";

export const executeUpdateOrganisationFeedback = async (params: {
  client: PoolClient;
  feedback: OrganisationInvitationFeedback;
  organisationSettingId: string;
  userId: string;
  errorCode: string;
}): Promise<void> => {
  try {
    const { feedback, organisationSettingId } = params;
    await params.client.query(
      `
        UPDATE organisation_user_configurations
        SET invitation_status=$1::text, invitation_feedback_at = $2, preferred_transports = $3
        WHERE id = $4 and user_id = $5
      `,
      [
        feedback.invitationStatusFeedback,
        new Date().toISOString(),
        utils.postgresArrayify(feedback.preferredTransports),
        organisationSettingId,
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
