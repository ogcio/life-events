/*
export const OrganisationSettingSchema = Type.Object({
  phoneNumber: NullableStringType,
  emailAddress: NullableStringType,
  organisationId: Type.String(),
  organisationInvitationStatus: InvitationStatusUnionType,
  organisationInvitationSentAt: Type.Optional(Type.String()),
  organisationInvitationFeedbackAt: Type.Optional(Type.String()),
  correlationQuality: CorrelationQualityUnionType,
  userStatus: UserStatusUnionType,
  details: Type.Optional(UserDetailsSchema),
});
*/

import { PostgresDb } from "@fastify/postgres";
import { getUserInvitations } from "../users/invitations/shared-invitations";
import { getUserByUserProfileId } from "../users/shared-users";

const ERROR_PROCESS = "ORGANISATION_SETTINGS";

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
      errorCode: ERROR_PROCESS,
    });

    return await getUserInvitations({
      userProfileId,
      client,
      errorCode: ERROR_PROCESS,
    });
  } finally {
    client.release();
  }
};
