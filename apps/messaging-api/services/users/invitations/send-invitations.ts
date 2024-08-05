import { FastifyBaseLogger } from "fastify";
import { PoolClient } from "pg";
import {
  OrganisationSetting,
  UsersImport,
} from "../../../types/usersSchemaDefinitions";
import {
  DEFAULT_LANGUAGE,
  MessageInput,
} from "../../../types/schemaDefinitions";
import { PostgresDb } from "@fastify/postgres";
import { ALL_TRANSPORTS } from "../shared-users";
import { ServerError } from "shared-errors";
import { CreateMessageParams } from "../../messages/messaging";
import { processMessages } from "../../messages/messages";

const SEND_INVITATIONS_ERROR = "SEND_INVITATIONS_ERROR";

export const sendInvitationsForUsersImport = async (params: {
  pg: PostgresDb;
  logger: FastifyBaseLogger;
  toImportUsers: UsersImport;
  requestUserId: string;
  requestOrganizationId: string;
}): Promise<void> => {
  const { pg, toImportUsers } = params;
  const importedUserIds: { userProfileId: string; userId: string }[] = [];
  const userIds: string[] = [];
  const langForUserId: {
    [userId: string]: string;
  } = {};
  for (const userData of toImportUsers.usersData) {
    if (!userData.relatedUserId) {
      // means that the user has no contacts, nor email or phone
      // TODO Notify to the user whom imported that is not manageable
      continue;
    }
    if (userData.relatedUserProfileId) {
      importedUserIds.push({
        userProfileId: userData.relatedUserProfileId,
        userId: userData.relatedUserId,
      });
    } else {
      langForUserId[userData.relatedUserId] = DEFAULT_LANGUAGE;
    }
    userIds.push(userData.relatedUserId);
  }

  if (importedUserIds.length === 0 && Object.keys(langForUserId).length === 0) {
    return;
  }

  const languagePerUser = {
    ...langForUserId,
    ...getLanguagePerUser({
      userIdsToSearchFor: importedUserIds,
      requestUserId: params.requestUserId,
    }),
  };
  const client = await pg.pool.connect();
  try {
    await client.query("BEGIN");
    const userInvitations = await getSettingsPerUserIds({
      userIds,
      organisationId: toImportUsers.organisationId,
      client,
      importId: params.toImportUsers.importId,
    });

    const toSend = prepareInvitations({
      userInvitations,
      perIdLanguage: languagePerUser,
    });

    const sent = await sendInvitations({
      toSend,
      organisationId: toImportUsers.organisationId,
    });

    await processMessages({
      inputMessages: sent.toCreateMessages,
      scheduleAt: new Date().toISOString(),
      errorProcess: SEND_INVITATIONS_ERROR,
      pgPool: pg.pool,
      logger: params.logger,
      senderUser: {
        profileId: params.requestUserId,
        organizationId: params.requestOrganizationId,
      },
      allOrNone: true,
    });

    await setImportedAsInvited({
      invited: sent,
      toImportUsers: params.toImportUsers,
      client,
    });

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");

    throw error;
  } finally {
    client.release();
  }
};

const getSettingsPerUserIds = async (params: {
  userIds: string[];
  organisationId: string;
  client: PoolClient;
  importId: string;
}): Promise<OrganisationSetting[]> => {
  let userIndex = 2;
  const idsIndexes = params.userIds.map(() => `$${userIndex++}`);

  try {
    const result = await params.client.query<OrganisationSetting>(
      `
        SELECT 
          ouc.user_id as "userId",
          users.user_profile_id as "userProfileId",
          users.email as "emailAddress",
          users.phone as "phoneNumber",
          users.details as "details",
          ouc.organisation_id as "organisationId",
          ouc.invitation_status as "organisationInvitationStatus",
          ouc.invitation_sent_at  as "organisationInvitationSentAt",
          ouc.invitation_feedback_at as "organisationInvitationFeedbackAt",
          ouc.preferred_transports as "organisationPreferredTransports",
          users.correlation_quality as "correlationQuality",
          users.user_status as "userStatus"
        FROM users
        LEFT JOIN organisation_user_configurations ouc on ouc.user_id = users.id 
          AND ouc.organisation_id = $1
        LEFT JOIN users_imports on users_imports.organisation_id = ouc.organisation_id
        WHERE users.id in (${idsIndexes.join(", ")}) AND users_imports.import_id = $${userIndex}
      `,
      [params.organisationId, ...params.userIds, params.importId],
    );

    return result.rows;
  } catch (error) {
    throw new ServerError(
      SEND_INVITATIONS_ERROR,
      `Error retrieving organisation settings`,
      error,
    );
  }
};

interface InvitationsPerLanguage {
  [x: string]: {
    invitations: OrganisationSetting[];
    toSendIds: string[];
    userIds: string[];
  };
}

interface ToSendInvitations {
  joinMessaging: InvitationsPerLanguage;
  joinOrganisation: InvitationsPerLanguage;
  welcome: InvitationsPerLanguage;
}

const prepareInvitations = (params: {
  userInvitations: OrganisationSetting[];
  perIdLanguage: { [x: string]: string };
}): ToSendInvitations => {
  const toSend: ToSendInvitations = {
    joinMessaging: {},
    joinOrganisation: {},
    welcome: {},
  };
  for (const toInvite of params.userInvitations) {
    const language = params.perIdLanguage[toInvite.userId];
    // User profile id has higher priority, if exists, because in this
    // way we know that we have to use contacts from the user profile
    const toUseId = toInvite.userProfileId ?? toInvite.userId;
    if (toInvite.userStatus === "to_be_invited") {
      // send invitation to messaging
      //if we send invitation to platform we don't send another email for organisation
      if (!toSend.joinMessaging[language]) {
        toSend.joinMessaging[language] = {
          invitations: [],
          toSendIds: [],
          userIds: [],
        };
      }
      toSend.joinMessaging[language].userIds.push(toInvite.userId);
      toSend.joinMessaging[language].toSendIds.push(toUseId);
      toSend.joinMessaging[language].invitations.push(toInvite);
      continue;
    }

    if (toInvite.organisationInvitationStatus === "to_be_invited") {
      // send invitation to accept comunication from org
      if (!toSend.joinOrganisation[language]) {
        toSend.joinOrganisation[language] = {
          invitations: [],
          toSendIds: [],
          userIds: [],
        };
      }
      toSend.joinOrganisation[language].userIds.push(toInvite.userId);
      toSend.joinOrganisation[language].toSendIds.push(toUseId);
      toSend.joinOrganisation[language].invitations.push(toInvite);
      continue;
    }

    if (toInvite.organisationInvitationStatus === "accepted") {
      // send invitation to say the have been onboarded
      if (!toSend.welcome[language]) {
        toSend.welcome[language] = {
          invitations: [],
          toSendIds: [],
          userIds: [],
        };
      }
      toSend.welcome[language].userIds.push(toInvite.userId);
      toSend.welcome[language].toSendIds.push(toUseId);
      toSend.welcome[language].invitations.push(toInvite);
    }
  }

  return toSend;
};

const sendInvitations = async (params: {
  toSend: ToSendInvitations;
  organisationId: string;
}): Promise<{
  invitedToMessaging: string[];
  invitedToOrganisation: string[];
  welcomed: string[];
  toCreateMessages: CreateMessageParams[];
}> => {
  const sending: CreateMessageParams[] = [];
  const output: {
    invitedToMessaging: string[];
    invitedToOrganisation: string[];
    welcomed: string[];
  } = { invitedToMessaging: [], invitedToOrganisation: [], welcomed: [] };
  for (const language of Object.keys(params.toSend.joinMessaging)) {
    const messageInput = getJoinMessagingMessageForLanguage(language);
    const userIds = params.toSend.joinMessaging[language].toSendIds;
    for (const userId of userIds) {
      sending.push({
        bypassConsent: true,
        excerpt: messageInput.excerpt,
        lang: messageInput.lang,
        organisationId: params.organisationId,
        plainText: messageInput.plainText,
        preferredTransports: ALL_TRANSPORTS,
        receiverUserId: userId,
        richText: messageInput.richText,
        scheduleAt: new Date().toISOString(),
        security: "high",
        subject: messageInput.subject,
        threadName: messageInput.threadName || messageInput.subject,
      });
    }

    output.invitedToMessaging.push(
      ...params.toSend.joinMessaging[language].userIds,
    );
    // also push to organisation to then update the
    // invitation on the db
    output.invitedToOrganisation.push(
      ...params.toSend.joinMessaging[language].userIds,
    );
  }

  for (const language of Object.keys(params.toSend.joinOrganisation)) {
    const messageInput = getJoinOrgMessageForLanguage(language);
    const userIds = params.toSend.joinOrganisation[language].toSendIds;
    for (const userId of userIds) {
      sending.push({
        bypassConsent: true,
        excerpt: messageInput.excerpt,
        lang: messageInput.lang,
        organisationId: params.organisationId,
        plainText: messageInput.plainText,
        preferredTransports: ALL_TRANSPORTS,
        receiverUserId: userId,
        richText: messageInput.richText,
        scheduleAt: new Date().toISOString(),
        security: "high",
        subject: messageInput.subject,
        threadName: messageInput.threadName || messageInput.subject,
      });
    }

    output.invitedToOrganisation.push(
      ...params.toSend.joinOrganisation[language].userIds,
    );
  }

  for (const language of Object.keys(params.toSend.welcome)) {
    const messageInput = getWelcomeMessageForLanguage(language);
    const userIds = params.toSend.welcome[language].toSendIds;
    for (const userId of userIds) {
      sending.push({
        bypassConsent: true,
        excerpt: messageInput.excerpt,
        lang: messageInput.lang,
        organisationId: params.organisationId,
        plainText: messageInput.plainText,
        preferredTransports: ALL_TRANSPORTS,
        receiverUserId: userId,
        richText: messageInput.richText,
        scheduleAt: new Date().toISOString(),
        security: "high",
        subject: messageInput.subject,
        threadName: messageInput.threadName || messageInput.subject,
      });
    }
    output.welcomed.push(...params.toSend.welcome[language].userIds);
  }

  return {
    invitedToMessaging: output.invitedToMessaging,
    invitedToOrganisation: [...new Set(output.invitedToOrganisation)],
    welcomed: [...new Set(output.welcomed)],
    toCreateMessages: sending,
  };
};

const getLanguagePerUser = (params: {
  userIdsToSearchFor: { userProfileId: string; userId: string }[];
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
    output[id.userId] = DEFAULT_LANGUAGE;
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
    threadName: "JoinOrganisation",
    lang: language,
  };
};

const getWelcomeMessageForLanguage = (language: string): MessageInput => {
  // TODO This one will be updated and translated in a next PR
  return {
    subject: "Welcome!",
    excerpt: "An organisation wants to send you messages!",
    plainText: "Click here to join our platform",
    richText: "Click here to join our platform",
    threadName: "JoinOrganisation",
    lang: language,
  };
};

const setImportedAsInvited = async (params: {
  invited: {
    invitedToMessaging: string[];
    invitedToOrganisation: string[];
    welcomed: string[];
  };
  toImportUsers: UsersImport;
  client: PoolClient;
}): Promise<void> => {
  const { invitedToMessaging, invitedToOrganisation, welcomed } =
    params.invited;
  if (
    invitedToMessaging.length === 0 &&
    invitedToOrganisation.length === 0 &&
    welcomed.length === 0
  ) {
    return;
  }

  try {
    await params.client.query("BEGIN");
    if (invitedToMessaging.length) {
      let userIndex = 2;
      const idsIndexes = invitedToMessaging.map(() => `$${userIndex++}`);
      await params.client.query(
        `
          UPDATE users
          SET user_status=$1
          WHERE id in (${idsIndexes.join(", ")});
        `,
        ["pending", ...invitedToMessaging],
      );
    }
    if (invitedToOrganisation.length) {
      let userIndex = 4;
      const idsIndexes = invitedToOrganisation.map(() => `$${userIndex++}`);
      await params.client.query(
        `
          UPDATE organisation_user_configurations
          SET invitation_status=$1, invitation_sent_at = $2
          WHERE organisation_id = $3 and user_id in (${idsIndexes.join(", ")});
        `,
        [
          "pending",
          new Date(new Date().toUTCString()).toISOString(),
          params.toImportUsers.organisationId,
          ...invitedToOrganisation,
        ],
      );
    }
    if (welcomed.length) {
      let userIndex = 3;
      const idsIndexes = welcomed.map(() => `$${userIndex++}`);
      await params.client.query(
        `
          UPDATE organisation_user_configurations
          SET invitation_sent_at = $1
          WHERE organisation_id = $2 and user_id in (${idsIndexes.join(", ")});
        `,
        [
          new Date(new Date().toUTCString()).toISOString(),
          params.toImportUsers.organisationId,
          ...welcomed,
        ],
      );
    }

    await params.client.query("COMMIT");
  } catch (error) {
    await params.client.query("ROLLBACK");
    throw error;
  }
};
