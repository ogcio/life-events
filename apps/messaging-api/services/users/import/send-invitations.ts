import { FastifyBaseLogger } from "fastify";
import { PoolClient } from "pg";
import {
  UserInvitation,
  UsersImport,
} from "../../../types/usersSchemaDefinitions";
import {
  DEFAULT_LANGUAGE,
  MessageInput,
} from "../../../types/schemaDefinitions";
import { createMessage } from "../../messages/messages";
import { PostgresDb } from "@fastify/postgres";
import {
  ALL_TRANSPORTS,
  getUserInvitationsForOrganisation,
} from "../shared-users";
import { ServerError } from "shared-errors";

const SEND_INVITATIONS_ERROR = "SEND_INVITATIONS_ERROR";

export const sendInvitationsForUsersImport = async (params: {
  pg: PostgresDb;
  logger: FastifyBaseLogger;
  toImportUsers: UsersImport;
  requestUserId: string;
}): Promise<void> => {
  const { pg, toImportUsers } = params;
  const importedUserIds: { userProfileId: string; userId: string }[] = [];
  const userIds: string[] = [];
  const langForUserId: {
    [userId: string]: string;
  } = {};
  for (const userData of toImportUsers.usersData) {
    if (!userData.relatedUserId) {
      throw new ServerError(
        "SEND_INVITATIONS_ERROR",
        `Something went wrong importing users, user with index ${userData.importIndex} is missing user id`,
      );
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
    const userInvitations = await getUserInvitations({
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
      pg: params.pg,
      organisationId: toImportUsers.organisationId,
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

const getUserInvitations = async (params: {
  userIds: string[];
  organisationId: string;
  client: PoolClient;
  importId: string;
}): Promise<UserInvitation[]> => {
  let userIndex = 1;
  const idsIndexes = params.userIds.map(() => `$${userIndex++}`);

  return await getUserInvitationsForOrganisation({
    client: params.client,
    whereClauses: [
      `users.id in (${idsIndexes.join(", ")})`,
      `users_imports.import_id = $${userIndex}`,
    ],
    whereValues: [...params.userIds, params.importId],
    organisationId: params.organisationId,
    errorCode: SEND_INVITATIONS_ERROR,
  });
};

interface InvitationsPerLanguage {
  [x: string]: {
    invitations: UserInvitation[];
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
  userInvitations: UserInvitation[];
  perIdLanguage: { [x: string]: string };
}): ToSendInvitations => {
  const toSend: ToSendInvitations = {
    joinMessaging: {},
    joinOrganisation: {},
    welcome: {},
  };
  for (const toInvite of params.userInvitations) {
    const language = params.perIdLanguage[toInvite.id];
    // User profile id has higher priority, if exists, because in this
    // way we know that we have to use contacts from the user profile
    const toUseId = toInvite.userProfileId ?? toInvite.id;
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
      toSend.joinMessaging[language].userIds.push(toInvite.id);
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
      toSend.joinOrganisation[language].userIds.push(toInvite.id);
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
      toSend.welcome[language].userIds.push(toInvite.id);
      toSend.welcome[language].toSendIds.push(toUseId);
      toSend.welcome[language].invitations.push(toInvite);
    }
  }

  return toSend;
};

const sendInvitations = async (params: {
  toSend: ToSendInvitations;
  pg: PostgresDb;
  organisationId: string;
}): Promise<{
  invitedToMessaging: string[];
  invitedToOrganisation: string[];
  welcomed: string[];
}> => {
  const sending: Promise<void>[] = [];
  const output: {
    invitedToMessaging: string[];
    invitedToOrganisation: string[];
    welcomed: string[];
  } = { invitedToMessaging: [], invitedToOrganisation: [], welcomed: [] };
  for (const language of Object.keys(params.toSend.joinMessaging)) {
    const messageInput = getJoinMessagingMessageForLanguage(language);
    const userIds = params.toSend.joinMessaging[language].toSendIds;
    sending.push(
      createMessage({
        payload: {
          message: messageInput,
          preferredTransports: ALL_TRANSPORTS,
          userIds,
          scheduleAt: new Date().toISOString(),
          security: "high",
        },
        pg: params.pg,
      }),
    );
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
    sending.push(
      createMessage({
        payload: {
          message: messageInput,
          preferredTransports: ALL_TRANSPORTS,
          userIds,
          scheduleAt: Date.now().toString(),
          security: "high",
        },
        pg: params.pg,
      }),
    );
    output.invitedToOrganisation.push(
      ...params.toSend.joinOrganisation[language].userIds,
    );
  }

  for (const language of Object.keys(params.toSend.welcome)) {
    const messageInput = getWelcomeMessageForLanguage(language);
    const userIds = params.toSend.welcome[language].toSendIds;
    sending.push(
      createMessage({
        payload: {
          message: messageInput,
          preferredTransports: ALL_TRANSPORTS,
          userIds,
          scheduleAt: Date.now().toString(),
          security: "high",
        },
        pg: params.pg,
      }),
    );
    output.welcomed.push(...params.toSend.welcome[language].userIds);
  }

  await Promise.all(sending);

  return {
    invitedToMessaging: [...new Set(output.invitedToMessaging)],
    invitedToOrganisation: [...new Set(output.invitedToOrganisation)],
    welcomed: [...new Set(output.welcomed)],
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

const getWelcomeMessageForLanguage = (language: string): MessageInput => {
  // TODO This one will be updated and translated in a next PR
  return {
    subject: "Welcome!",
    excerpt: "An organisation wants to send you messages!",
    plainText: "Click here to join our platform",
    richText: "Click here to join our platform",
    messageName: "Join Organisation",
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