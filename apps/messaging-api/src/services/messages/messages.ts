import { PostgresDb } from "@fastify/postgres";
import { ReadMessage } from "../../types/schemaDefinitions.js";
import { ServiceError, utils } from "../../utils.js";
import { FastifyBaseLogger } from "fastify";
import { Pool, PoolClient } from "pg";
import { mailService } from "../../routes/providers/services.js";
import { awsSnsSmsService } from "../sms/aws.js";
import {
  getUserProfiles,
  MessagingUserProfile,
  ProfileSdkFacade,
} from "../users/shared-users.js";
import { isNativeError } from "util/types";
import {
  BadRequestError,
  isLifeEventsError,
  LifeEventsError,
  NotFoundError,
  ServerError,
  ThirdPartyError,
  AuthorizationError,
} from "shared-errors";
import { LoggingError, toLoggingError } from "logging-wrapper";
import {
  MessagingEventLogger,
  MessagingEventType,
  newMessagingEventLogger,
} from "./eventLogger.js";
import {
  getProfileSdk,
  getUploadSdk,
} from "../../utils/authentication-factory.js";
import {
  CreateMessageParams,
  MessagingService,
  newMessagingService,
} from "./messaging.js";
import { Upload } from "building-blocks-sdk";

const EXECUTE_JOB_ERROR = "EXECUTE_JOB_ERROR";

export const getMessage = async (params: {
  pg: PostgresDb;
  userId: string;
  messageId: string;
}): Promise<ReadMessage> => {
  const data = await params.pg.query<ReadMessage>(
    `   
    SELECT 
        messages.subject as "subject", 
        messages.excerpt as "excerpt", 
        messages.plain_text as "plainText",
        messages.rich_text as "richText",
        messages.created_at as "createdAt",
        messages.thread_name as "threadName",
        messages.organisation_id as "organisationId",
        messages.user_id as "recipientUserId",
        messages.is_seen as "isSeen",
        messages.security_level as "security",
        COALESCE(ARRAY_AGG(attachments_messages.attachment_id) FILTER (WHERE attachments_messages.attachment_id IS NOT NULL), '{}') AS "attachments"
    FROM messages
    LEFT JOIN users 
        ON users.id::text = messages.user_id
    LEFT JOIN attachments_messages 
        ON attachments_messages.message_id = messages.id
    WHERE 
        (messages.user_id = $1 OR users.user_profile_id::text = $1) 
        AND messages.id = $2
    GROUP BY 
        messages.subject, 
        messages.excerpt, 
        messages.plain_text, 
        messages.rich_text, 
        messages.created_at, 
        messages.thread_name, 
        messages.organisation_id, 
        messages.user_id, 
        messages.is_seen, 
        messages.security_level, 
        users.id
    ORDER BY messages.created_at DESC;
    `,
    [params.userId, params.messageId],
  );

  if (data.rowCount === 0) {
    throw new NotFoundError(
      "GET_MESSAGE_ERROR",
      `No message with id ${params.messageId} for the logged in user does exist`,
    );
  }
  return data.rows[0];
};

export const executeJob = async (params: {
  pg: PostgresDb;
  logger: FastifyBaseLogger;
  jobId: string;
  token: string;
}) => {
  const statusWorking: scheduledMessageByTemplateStatus = "working";
  const statusDelivered: scheduledMessageByTemplateStatus = "delivered";
  let organizationId = ""; // lets get this from the jobs table
  let job:
    | {
        jobId: string;
        userId: string;
        type: string;
        status: scheduledMessageByTemplateStatus;
      }
    | undefined;

  const eventLogger = newMessagingEventLogger(params.pg.pool, params.logger);

  const client = await params.pg.pool.connect();
  try {
    client.query("begin");

    const jobStatusResult = await client.query<{
      status: scheduledMessageByTemplateStatus;
      entityId: string;
      organizationId: string;
    }>(
      `
        select
          coalesce(delivery_status, 'pending') as "status",
          job_id as "entityId",
          organisation_id as "organizationId"
        from jobs where id = $1
        and case when delivery_status is not null then delivery_status != $2 else true end
        and job_token = $3
    `,
      [params.jobId, statusDelivered, params.token],
    );

    const jobResult = jobStatusResult.rows.at(0);

    if (!jobResult) {
      await eventLogger.log(MessagingEventType.deliverMessageError, [
        { messageId: "" }, // job id error field?
      ]);
      throw new NotFoundError(EXECUTE_JOB_ERROR, "job doesn't exist");
    }

    await eventLogger.log(MessagingEventType.deliverMessagePending, [
      { messageId: jobResult.entityId }, // job id error field?
    ]);

    if (jobResult.status === "working") {
      throw new BadRequestError(
        EXECUTE_JOB_ERROR,
        "job is already in progress",
      );
    }

    job = await client
      .query<{
        userId: string;
        jobId: string;
        type: string;
        status: scheduledMessageByTemplateStatus;
      }>(
        `
        update jobs set delivery_status = $1
        where id = $2
        returning 
        user_id as "userId",
        job_type as "type",
        job_id as "jobId"
    `,
        [statusWorking, params.jobId],
      )
      .then((res) => res.rows.at(0));
    organizationId = jobResult.organizationId;
    client.query("commit");
  } catch (err) {
    client.query("rollback");

    await eventLogger.log(MessagingEventType.deliverMessageError, [
      { messageId: "" },
    ]);
    if (isLifeEventsError(err)) {
      throw err;
    }

    const msg = utils.isError(err) ? err.message : "failed to fetch job";
    throw new ServerError(EXECUTE_JOB_ERROR, msg);
  } finally {
    client.release();
  }

  if (!job?.userId || !job.type) {
    await eventLogger.log(MessagingEventType.deliverMessageError, [
      { messageId: job?.jobId || "" },
    ]);
    throw new ServerError(EXECUTE_JOB_ERROR, "job row missing critical fields");
  }

  let error: LoggingError | undefined;
  if (job.type === "message") {
    try {
      const serviceErrors = await scheduleMessage(
        params.pg.pool,
        job.jobId,
        job.userId,
        eventLogger,
        organizationId,
      );

      for (const err of serviceErrors) {
        params.logger.error({ error: err.error }, err.msg);
      }

      const firstError = serviceErrors.filter((err) => err.critical).at(0);
      if (firstError) {
        error = toLoggingError(
          new ServerError(EXECUTE_JOB_ERROR, firstError.msg),
        );
      }
    } catch (err) {
      const msg = utils.isError(err)
        ? err.message
        : "failed to create message job";
      error = toLoggingError(new ServerError(EXECUTE_JOB_ERROR, msg));
    }
  }

  if (error) {
    params.logger.error({ error, job, jobId: params.jobId });
    const statusFailed: scheduledMessageByTemplateStatus = "failed";
    try {
      await params.pg.pool.query(
        `
          update jobs set delivery_status = $1
          where id = $2
          `,
        [statusFailed, params.jobId],
      );
    } catch (err) {
      await eventLogger.log(MessagingEventType.deliverMessageError, [
        { messageId: job.jobId },
      ]);
      const msg = utils.isError(err)
        ? err.message
        : "failed to update job delivery status";
      throw new ServerError(EXECUTE_JOB_ERROR, msg);
    }

    await eventLogger.log(MessagingEventType.deliverMessageError, [
      { messageId: job.jobId },
    ]);
    throw new ServerError(EXECUTE_JOB_ERROR, error.message);
  }
  await eventLogger.log(MessagingEventType.deliverMessage, [
    { messageId: job.jobId },
  ]);
};

type scheduledMessageByTemplateStatus =
  | "pending"
  | "working"
  | "failed"
  | "delivered";

const ERROR_PROCESS = "SCHEDULE_MESSAGE";

const scheduleMessage = async (
  pool: Pool,
  messageId: string,
  userId: string,
  eventLogger: MessagingEventLogger,
  organizationId: string,
): Promise<ServiceError[]> => {
  const client = await pool.connect();
  const errors: ServiceError[] = [];

  const preferredTransports: string[] = [];
  let transportationSubject: string | undefined;
  let transportationExcerpt: string | undefined;
  let transportationBody: string | undefined;

  try {
    client.query("BEGIN");

    const messageUser = await client
      .query<{
        transports?: string[];
        subject: string;
        excerpt: string;
        body: string;
      }>(
        `
      update messages set 
        is_delivered = true,
        updated_at = now()
      where id = $1
      returning 
        preferred_transports as "transports",
        excerpt,
        subject,
        case when rich_text <> '' then rich_text else plain_text end as "body"
    `,
        [messageId],
      )
      .then((res) => res.rows.at(0));

    if (!messageUser) {
      throw new NotFoundError(
        ERROR_PROCESS,
        `failed to find message for id ${messageId}`,
      );
    }

    preferredTransports.push(...(messageUser?.transports ?? []));
    transportationBody = messageUser.body;
    transportationExcerpt = messageUser.excerpt;
    transportationSubject = messageUser.subject;

    const statusDelivered: scheduledMessageByTemplateStatus = "delivered";
    await client.query(
      `
      update jobs set delivery_status = $1
      where job_id = $2 and user_id = $3
    `,
      [statusDelivered, messageId, userId],
    );

    client.query("COMMIT");
  } catch (err) {
    client.query("ROLLBACK");
    const msg = utils.isError(err) ? err.message : "failed";
    errors.push({ error: { err }, msg, critical: true });
  } finally {
    client.release();
  }

  const transportsClient = await pool.connect();
  const profileSdk = await getProfileSdk(organizationId);
  const messageSdk = {
    selectUsers(ids: string[]) {
      return getUserProfiles(ids, transportsClient);
    },
  };
  const profileService = ProfileSdkFacade(profileSdk, messageSdk);
  try {
    const { data } = await profileService.selectUsers([userId]);
    const user = data?.at(0);
    if (!user) {
      throw new NotFoundError(ERROR_PROCESS, "no user profile found");
    }

    for (const transport of preferredTransports) {
      if (transport === "email") {
        if (!user.email) {
          await eventLogger.log(MessagingEventType.emailError, [
            {
              messageId,
              messageKey: "noEmail",
            },
          ]);
          continue;
        }
        if (!transportationSubject) {
          await eventLogger.log(MessagingEventType.emailError, [
            {
              messageId,
              messageKey: "noSubject",
            },
          ]);
          continue;
        }

        let providerId: string | undefined;
        try {
          const mailservice = mailService(transportsClient);
          const provider = await mailservice.getPrimaryProvider(organizationId);

          if (!provider) {
            await eventLogger.log(MessagingEventType.emailError, [
              {
                messageId,
                messageKey: "noProvider",
              },
            ]);
            continue;
          }
          await mailservice.sendMail({
            provider,
            email: user.email,
            subject: transportationSubject,
            body: transportationBody ?? "",
          });
        } catch (err) {
          await eventLogger.log(MessagingEventType.emailError, [
            {
              messageId,
              messageKey: "failedToSend",
              details: JSON.stringify(err),
            },
          ]);
          errors.push({
            critical: false,
            error: {
              userId,
              providerId,
              transportationSubject,
              transportationBody,
            },
            msg: "failed to send email",
          });
        }
      } else if (transport === "sms") {
        if (!user.phone) {
          await eventLogger.log(MessagingEventType.smsError, [
            {
              messageId,
              messageKey: "noPhone",
            },
          ]);
          continue;
        }
        if (!transportationExcerpt || !transportationSubject) {
          await eventLogger.log(MessagingEventType.smsError, [
            {
              messageId,
              messageKey: "missingContent",
            },
          ]);
          continue;
        }

        const configQueryResult = await transportsClient.query<{
          config: unknown;
        }>(
          `
          select config from sms_providers
          where is_primary and organisation_id = $1 and deleted_at is null
          limit 1
        `,
          [organizationId],
        );

        const config = configQueryResult.rows.at(0)?.config;

        if (!config) {
          await eventLogger.log(MessagingEventType.smsError, [
            {
              messageId,
              messageKey: "noProvider",
            },
          ]);
          continue;
        }

        if (utils.isSmsAwsConfig(config)) {
          const service = awsSnsSmsService(
            config.accessKey,
            config.secretAccessKey,
            config.region,
          );

          try {
            await service.Send(transportationExcerpt, user.phone);
          } catch (err) {
            eventLogger.log(MessagingEventType.smsError, [
              {
                messageId,
              },
            ]);
            const msg = utils.isError(err) ? err.message : "failed to send sms";
            errors.push({
              critical: false,
              error: {
                userId,
                transportationExcerpt,
                transportationSubject,
              },
              msg,
            });
          }
        }
      }
    }
  } catch (err) {
    errors.push({
      critical: false,
      error: { err },
      msg: isNativeError(err)
        ? err.message
        : "failed to externally transport message",
    });
  } finally {
    transportsClient.release();
  }

  return errors;
};

export const processMessages = async (params: {
  inputMessages: Omit<CreateMessageParams, "senderApplicationId">[];
  scheduleAt: string;
  errorProcess: string;
  pgPool: Pool;
  logger: FastifyBaseLogger;
  senderUser: { profileId: string; organizationId?: string };
  isM2MApplicationSender: boolean;
  organizationId?: string;
  allOrNone: boolean;
}): Promise<{
  scheduledMessages: { jobId: string; userId: string; entityId: string }[];
  errors: LifeEventsError[];
}> => {
  const {
    inputMessages,
    scheduleAt,
    errorProcess,
    pgPool,
    logger,
    senderUser,
    allOrNone,
    isM2MApplicationSender,
  } = params;
  const { organizationId } = params;
  if (!organizationId && !senderUser.organizationId) {
    throw new BadRequestError(
      errorProcess,
      "You have to set organization id to send messages",
    );
  }

  const poolClient = await pgPool.connect();
  try {
    // If any message that doesn't override consent has any user that isnt active, we throw unauthorized
    const receiverUserIdsForMessagesWithoutConsentBypass = inputMessages
      .filter((message) => !message.bypassConsent)
      .map((message) => message.receiverUserId);

    if (receiverUserIdsForMessagesWithoutConsentBypass.length) {
      const isAnyUserNotActiveAndAccepted = await poolClient.query<{
        exists: boolean;
      }>(
        `
          select exists(
            select * from users u 
            join organisation_user_configurations o on o.user_id = u.id
            where 
            o.invitation_status != 'accepted' 
            and u.user_status != 'active'
            and u.id = any($1)
            limit 1
          )
        `,
        [receiverUserIdsForMessagesWithoutConsentBypass],
      );

      if (isAnyUserNotActiveAndAccepted.rows.at(0)?.exists) {
        throw new AuthorizationError(
          params.errorProcess,
          "user exist that isn't accepted and active for any of the input messages, no message sent",
        );
      }
    }

    const messageService = newMessagingService(poolClient);
    const eventLogger = newMessagingEventLogger(pgPool, logger);
    const toScheduleMessages = [];
    const eventLoggingEntries = [];
    const outputMessages: {
      scheduledMessages: { jobId: string; userId: string; entityId: string }[];
      errors: LifeEventsError[];
    } = { scheduledMessages: [], errors: [] };
    if (
      senderUser.organizationId &&
      organizationId &&
      organizationId !== senderUser.organizationId
    ) {
      throw new BadRequestError(
        errorProcess,
        "You can't send messages to a different organization you are logged in to",
      );
    }
    const toUseOrganizationId = organizationId ?? senderUser.organizationId;
    if (!toUseOrganizationId) {
      throw new BadRequestError(
        errorProcess,
        "You have to choose an organization id to send a message",
      );
    }
    const uploadClient = await getUploadSdk(toUseOrganizationId);
    const senderData = isM2MApplicationSender
      ? getApplicationSenderData(senderUser.profileId)
      : await getUserProfileSenderData({
          senderUserId: senderUser.profileId,
          organizationId: toUseOrganizationId,
          errorProcess,
        });

    try {
      await poolClient.query("BEGIN");
      const createPromises = [];
      for (const toCreate of inputMessages) {
        createPromises.push(
          createMessageWithLog({
            createMessageParams: toCreate,
            ...senderData,
            messageService,
            eventLogger,
            poolClient,
            errorProcess,
            uploadClient,
          }),
        );
      }

      const createdMessages = await Promise.all(createPromises);
      const errors = [];
      for (const createdMessage of createdMessages) {
        const messageData = createdMessage.createdMessage;
        if (!messageData) {
          // if all or none is set to true
          // fails if one creation fails
          if (allOrNone) {
            throw createdMessage.error;
          }
          errors.push(createdMessage.error!);
          continue;
        }

        eventLoggingEntries.push({ messageId: messageData.id });

        toScheduleMessages.push({
          messageId: messageData.id,
          userId: messageData.user_id,
        });
      }
      outputMessages.errors = errors;
      await poolClient.query("COMMIT");
    } catch (error) {
      await poolClient.query("ROLLBACK");
      throw error;
    }

    if (!toScheduleMessages.length) {
      return outputMessages;
    }
    await eventLogger.log(
      MessagingEventType.scheduleMessage,
      eventLoggingEntries,
    );

    outputMessages.scheduledMessages = await scheduleMessagesWithLog({
      messageService,
      eventLogger,
      toScheduleMessages,
      organizationId: toUseOrganizationId!,
      scheduleAt,
    });

    return outputMessages;
  } finally {
    poolClient.release();
  }
};

const getApplicationSenderData = (
  senderUserId: string,
): {
  senderApplication: {
    id: string;
  };
} => ({ senderApplication: { id: senderUserId } });

const getUserProfileSenderData = async (params: {
  senderUserId: string;
  organizationId?: string;
  errorProcess: string;
}): Promise<{
  senderUser: {
    fullName: string;
    ppsn?: string | null;
    userProfileId: string;
  };
}> => {
  const { senderUserId, organizationId, errorProcess } = params;

  const profileSdk = await getProfileSdk(organizationId);
  const senderUserProfile = await profileSdk.getUser(senderUserId);
  if (!senderUserProfile.data) {
    throw new NotFoundError(errorProcess, "Sender user cannot be found");
  }
  if (senderUserProfile.error) {
    throw new ThirdPartyError(
      errorProcess,
      senderUserProfile.error.detail,
      senderUserProfile.error,
    );
  }

  const senderFullName =
    `${senderUserProfile.data.firstName} ${senderUserProfile.data.lastName}`.trim();

  return {
    senderUser: {
      ...senderUserProfile.data,
      fullName: senderFullName,
      userProfileId: senderUserId,
    },
  };
};

const scheduleMessagesWithLog = async (params: {
  messageService: MessagingService;
  eventLogger: MessagingEventLogger;
  organizationId: string;
  scheduleAt: string;
  toScheduleMessages: { messageId: string; userId: string }[];
}): Promise<{ jobId: string; userId: string; entityId: string }[]> => {
  try {
    return await params.messageService.scheduleMessages(
      params.toScheduleMessages,
      params.scheduleAt,
      params.organizationId,
    );
  } catch (error) {
    await params.eventLogger.log(
      MessagingEventType.scheduleMessageError,
      params.toScheduleMessages,
    );
    throw error;
  }
};

const createMessageWithLog = async (params: {
  senderUser?: {
    fullName: string;
    ppsn?: string | null;
    userProfileId: string;
  };
  senderApplication?: { id: string };
  messageService: MessagingService;
  eventLogger: MessagingEventLogger;
  createMessageParams: Omit<CreateMessageParams, "senderApplicationId">;
  poolClient: PoolClient;
  errorProcess: string;
  uploadClient: Upload;
}): Promise<{
  createdMessage?: {
    id: string;
    user_id: string;
    profile: MessagingUserProfile & { fullName: string };
  };
  error?: LifeEventsError;
}> => {
  const createMessage = params.createMessageParams;
  const receiverUserProfiles = await getUserProfiles(
    [params.createMessageParams.receiverUserId],
    params.poolClient,
  );

  if (receiverUserProfiles.length === 0) {
    return {
      error: new NotFoundError(
        params.errorProcess,
        `User with profile id ${params.createMessageParams.receiverUserId} not found`,
      ),
    };
  }

  await checkAttachments({
    uploadClient: params.uploadClient,
    userProfileId: receiverUserProfiles[0].id,
    attachmentIds: createMessage.attachments,
  });

  const receiverFullName =
    `${receiverUserProfiles[0].firstName} ${receiverUserProfiles[0].lastName}`.trim();
  let message = null;
  try {
    const senderData = {
      senderApplicationId: params.senderApplication?.id ?? null,
      senderUserProfileId: params.senderUser?.userProfileId ?? null,
    };
    message = await params.messageService.createMessage({
      ...createMessage,
      ...senderData,
    });
  } catch (error) {
    return {
      error: new ServerError(
        params.errorProcess,
        `failed to create message for recipient id ${createMessage.receiverUserId}`,
        error,
      ),
    };
  }
  await params.eventLogger.log(MessagingEventType.createRawMessage, [
    {
      organisationName: createMessage.organisationId,
      bypassConsent: createMessage.bypassConsent,
      security: createMessage.security,
      transports: createMessage.preferredTransports,
      scheduledAt: createMessage.scheduleAt,
      messageId: message.id,
      threadName: createMessage.threadName || "",
      subject: createMessage.subject,
      excerpt: createMessage.excerpt,
      richText: createMessage.richText,
      plainText: createMessage.plainText,
      language: createMessage.language,
      senderFullName: params.senderUser?.fullName || "",
      senderPPSN: params.senderUser?.ppsn || "",
      senderUserId: params.senderUser?.userProfileId || "",
      receiverFullName: receiverFullName || "",
      receiverPPSN: receiverUserProfiles[0].ppsn || "",
      receiverUserId: receiverUserProfiles[0].id || "",
      senderApplicationId: params.senderApplication?.id || "",
      attachments: createMessage.attachments,
    },
  ]);

  return {
    createdMessage: {
      ...message,
      profile: { ...receiverUserProfiles[0], fullName: receiverFullName },
    },
  };
};

const checkAttachments = async (params: {
  uploadClient: Upload;
  userProfileId: string;
  attachmentIds: string[];
}): Promise<void> => {
  if (params.attachmentIds.length === 0) {
    return;
  }

  const sharedFiles = await params.uploadClient.getSharedFilesForUser(
    params.userProfileId,
  );

  if (sharedFiles.error || !sharedFiles.data) {
    let message = "Error retrieving shared files";
    message += sharedFiles.error ? `: ${sharedFiles.error.detail}` : "";
    throw new ThirdPartyError(ERROR_PROCESS, message, sharedFiles.error);
  }

  const sharedFileIds: { [id: string]: string } = {};
  for (const shared of sharedFiles.data) {
    if (shared.id) {
      sharedFileIds[shared.id] = shared.id;
    }
  }

  for (const toSendAttachmentId of params.attachmentIds) {
    if (!(toSendAttachmentId in sharedFileIds)) {
      throw new BadRequestError(
        ERROR_PROCESS,
        `The attachment with id ${toSendAttachmentId} is not shared with the user with profile id ${params.userProfileId} for this organization`,
      );
    }
  }
};
