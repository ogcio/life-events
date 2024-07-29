import { PoolClient } from "pg";
import { isNativeError } from "util/types";
import { OrganisationInvitationFeedback } from "../../../types/usersSchemaDefinitions";
import { utils } from "../../../utils";
import { ServerError } from "shared-errors";

export const executeUpdateOrganisationFeedback = async (params: {
  client: PoolClient;
  feedback: OrganisationInvitationFeedback;
  organisationId?: string;
  organisationSettingId?: string;
  userId: string;
  errorCode: string;
}): Promise<void> => {
  try {
    const { feedback, organisationId, organisationSettingId } = params;
    const toQueryFieldName = organisationId ? "organisation_id" : "id";
    await params.client.query(
      `
        UPDATE organisation_user_configurations
        SET invitation_status=$1::text, invitation_feedback_at = $2, preferred_transports = $3
        WHERE ${toQueryFieldName} = $4 and user_id = $5
      `,
      [
        feedback.invitationStatusFeedback,
        new Date().toISOString(),
        utils.postgresArrayify(feedback.preferredTransports),
        organisationId ?? organisationSettingId,
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
