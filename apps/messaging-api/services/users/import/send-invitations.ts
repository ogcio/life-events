import { FastifyBaseLogger } from "fastify";
import { createError } from "@fastify/error";
import { Pool, PoolClient } from "pg";
import {
  UserInvitation,
  UsersImport,
} from "../../../types/usersSchemaDefinitions";
import { isNativeError } from "util/types";
import {
  DEFAULT_LANGUAGE,
  MessageInput,
} from "../../../types/schemaDefinitions";
import { createMessage } from "../../messages/messages";
import { PostgresDb } from "@fastify/postgres";

const SEND_INVITATIONS_ERROR = "SEND_INVITATIONS_ERROR";
const AVAILABLE_TRANSPORTS = ["sms", "email"];

export const sendInvitationsForUsersImport = async (params: {
  pg: PostgresDb;
  logger: FastifyBaseLogger;
  toImportUsers: UsersImport;
  requestUserId: string;
}): Promise<void> => {
  const { pg, toImportUsers } = params;
  const importedUserProfileIds = toImportUsers.usersData
    .filter((ud) => ud.relatedUserProfileId)
    .map((ud) => ud.relatedUserProfileId) as string[];

  if (importedUserProfileIds.length === 0) {
    return;
  }
  const languagePerUser = getLanguagePerUser({
    userIdsToSearchFor: importedUserProfileIds,
    requestUserId: params.requestUserId,
  });
  const client = await pg.connect();
  try {
    const userInvitations = await getUserInvitations({
      userProfileIds: importedUserProfileIds,
      organisationId: toImportUsers.organisationId,
      client,
    });

    const toSend = prepareInvitations({
      userInvitations,
      perIdLanguage: languagePerUser,
    });

    await sendInvitations({
      toSend,
      pg: params.pg,
      organisationId: toImportUsers.organisationId,
    });
  } finally {
    client.release();
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

interface InvitationsPerLanguage {
  [x: string]: { invitations: UserInvitation[]; ids: string[] };
}

interface ToSendInvitations {
  joinMessaging: InvitationsPerLanguage;
  joinOrganisation: InvitationsPerLanguage;
}

const prepareInvitations = (params: {
  userInvitations: UserInvitation[];
  perIdLanguage: { [x: string]: string };
}): ToSendInvitations => {
  const toSend: ToSendInvitations = {
    joinMessaging: {},
    joinOrganisation: {},
  };
  for (const toInvite of params.userInvitations) {
    const language = params.perIdLanguage[toInvite.userProfileId];
    if (toInvite.userStatus === "to_be_invited") {
      // send invitation to messaging
      //if we send invitation to platform we don't send another email for organisation
      if (!toSend.joinMessaging[language]) {
        toSend.joinMessaging[language] = { invitations: [], ids: [] };
      }
      toSend.joinMessaging[language].ids.push(toInvite.userProfileId);
      toSend.joinMessaging[language].invitations.push(toInvite);
      continue;
    }

    if (toInvite.organisationInvitationStatus === "to_be_invited") {
      // send invitation to accept comunication from org
      if (!toSend.joinOrganisation[language]) {
        toSend.joinOrganisation[language] = { invitations: [], ids: [] };
      }
      toSend.joinOrganisation[language].ids.push(toInvite.userProfileId);
      toSend.joinOrganisation[language].invitations.push(toInvite);
    }
  }

  return toSend;
};

const sendInvitations = async (params: {
  toSend: ToSendInvitations;
  pg: PostgresDb;
  organisationId: string;
}): Promise<void> => {
  const sending: Promise<void>[] = [];
  for (const language of Object.keys(params.toSend.joinMessaging)) {
    const messageInput = getJoinMessagingMessageForLanguage(language);
    const userIds = params.toSend.joinMessaging[language].ids;
    sending.push(
      createMessage({
        payload: {
          message: messageInput,
          preferredTransports: AVAILABLE_TRANSPORTS,
          userIds,
          scheduleAt: Date.now().toString(),
          security: "high",
        },
        pg: params.pg,
      }),
    );
  }

  for (const language of Object.keys(params.toSend.joinOrganisation)) {
    const messageInput = getJoinOrgMessageForLanguage(language);
    const userIds = params.toSend.joinOrganisation[language].ids;
    sending.push(
      createMessage({
        payload: {
          message: messageInput,
          preferredTransports: AVAILABLE_TRANSPORTS,
          userIds,
          scheduleAt: Date.now().toString(),
          security: "high",
        },
        pg: params.pg,
      }),
    );
  }

  await Promise.all(sending);
};

const getLanguagePerUser = (params: {
  userIdsToSearchFor: string[];
  requestUserId: string;
}): { [x: string]: string } => {
  if (params.userIdsToSearchFor.length === 0) {
    return {};
  }

  // Here I will invoke the user profile SDKS to get the preferred languages
  //const profileClient = new Profile(params.requestUserId);

  // Temporarily mocked
  const output: { [x: string]: string } = {};
  for (const id of params.userIdsToSearchFor) {
    output[id] = DEFAULT_LANGUAGE;
  }
  return output;
};

const getJoinMessagingMessageForLanguage = (language: string): MessageInput => {
  // TODO This one will be updated and translated in a next PR
  return {
    subject: "Join Messaging Platform",
    excerpt: "Join the messaging platform!",
    plainText: "Click here to join our platform",
    richText: "Click here to join our platform",
    messageName: "Join Messaging Platform",
    threadName: "JoinMessaging",
    lang: language,
  };
};

const getJoinOrgMessageForLanguage = (language: string): MessageInput => {
  // TODO This one will be updated and translated in a next PR
  return {
    subject: "An organisation wants to send you messages!",
    excerpt: "An organisation wants to send you messages!",
    plainText: "Click here to join our platform",
    richText: "Click here to join our platform",
    messageName: "Join Organisation",
    threadName: "JoinOrganisation",
    lang: language,
  };
};
