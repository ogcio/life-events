import { PostgresDb } from "@fastify/postgres";
import {
  CreateMessage,
  ReadMessage,
  ReadMessages,
} from "../../types/schemaDefinitions";
import { ServiceError, utils } from "../../utils";
import { FastifyBaseLogger } from "fastify";
import { JobType } from "aws-sdk/clients/importexport";
import { Pool } from "pg";
import { mailService } from "../../routes/providers/services";
import { awsSnsSmsService } from "../sms/aws";
import { Profile } from "building-blocks-sdk";
import { getUserProfiles, ProfileSdkFacade } from "../users/shared-users";
import { isNativeError } from "util/types";
import {
  BadRequestError,
  isLifeEventsError,
  NotFoundError,
  ServerError,
} from "shared-errors";
import { LoggingError, toLoggingError } from "logging-wrapper";
import {
  MessagingEventLogger,
  MessagingEventType,
  newMessagingEventLogger,
} from "./eventLogger";

const EXECUTE_JOB_ERROR = "EXECUTE_JOB_ERROR";

export const createMessage = async (params: {
  payload: CreateMessage;
  pg: PostgresDb;
  organizationId: string;
}): Promise<void> => {
  if (params.payload.message) {
    return createRawMessage({
      pg: params.pg,
      payload: { ...params.payload, message: params.payload.message! },
      organizationId: params.organizationId,
    });
  }

  // Deprecated
  if (params.payload.template) {
    return createMessageFromTemplate({
      pg: params.pg,
      payload: { ...params.payload, template: params.payload.template! },
    });
  }

  throw new BadRequestError(
    "CREATE_MESSAGE_ERROR",
    "At least one between 'message' and 'template' must be set",
  );
};

const createRawMessage = async (params: {
  pg: PostgresDb;
  payload: Omit<Required<CreateMessage>, "template">;
  organizationId: string;
}): Promise<void> => {
  const { message, preferredTransports, security, userIds, scheduleAt } =
    params.payload;
  const values: (string | null)[] = [];
  const args: string[] = [];

  values.push(
    message.subject,
    message.excerpt,
    message.richText,
    message.plainText,
    params.organizationId,
    security,
    preferredTransports.length
      ? utils.postgresArrayify(preferredTransports)
      : null,
    message.messageName,
    message.threadName || null,
    message.lang,
  );
  const originalValueSize = values.length;

  let i = originalValueSize + 1;
  for (const userId of userIds) {
    args.push(
      `(${[...new Array(originalValueSize)].map((_, i) => `$${i + 1}`)}, $${i})`,
    );
    values.push(userId);
    i += 1;
  }

  const insertQuery = `
              insert into messages(
                  subject,
                  excerpt, 
                  rich_text,
                  plain_text,
                  organisation_id,
                  security_level,
                  preferred_transports,
                  message_name,
                  thread_name,
                  lang,
                  user_id
              )
              values ${args.join(", ")}
              returning id, user_id as "userId"
          `;

  const ids = await params.pg
    .query<{ id: string; userId: string }>(insertQuery, values)
    .then((res) => res.rows);

  // Create jobs
  const jobType = "message";
  const jobArgs: string[] = [];
  const jobValues: string[] = [jobType];
  let argIndex = jobValues.length;
  for (const id of ids) {
    jobArgs.push(`($1, $${++argIndex}, $${++argIndex})`);
    jobValues.push(id.id, id.userId);
  }

  const jobs = await params.pg.pool
    .query<{ id: string; userId: string }>(
      `
            insert into jobs(job_type, job_id, user_id)
            values ${jobArgs.join(", ")}
            returning id as "id", user_id as "userId"
          `,
      jobValues,
    )
    .then((res) => res.rows);

  const body = jobs.map((job) => {
    const callbackUrl = new URL(
      `/api/v1/messages/jobs/${job.id}`,
      process.env.WEBHOOK_URL_BASE,
    );

    return {
      webhookUrl: callbackUrl.toString(),
      webhookAuth: job.userId, // Update when we're not using x-user-id as auth
      executeAt: scheduleAt,
    };
  });

  const url = new URL("/api/v1/tasks", process.env.SCHEDULER_API_URL);

  await fetch(url.toString(), {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "x-user-id": "tmp", "Content-Type": "application/json" },
  });
};

// Deprecated
const createMessageFromTemplate = async (params: {
  pg: PostgresDb;
  payload: Omit<Required<CreateMessage>, "message">;
}): Promise<void> => {
  const { template, preferredTransports, userIds, scheduleAt } = params.payload;

  const client = await params.pg.pool.connect();

  try {
    client.query("begin");

    const scheduleBase = await client
      .query<{ id: string }>(
        `
                insert into scheduled_message_by_templates(template_meta_id, preferred_transports)
                values($1, $2)
                returning id 
          `,
        [template.id, utils.postgresArrayify(preferredTransports)],
      )
      .then((res) => res.rows.at(0));

    if (!scheduleBase?.id) {
      throw Error(
        `failed to insert schedule message by template for template id ${template.id}`,
      );
    }

    const values: string[] = [scheduleBase.id, "template"];
    const args: string[] = [];

    let i = values.length;
    for (const userId of userIds) {
      args.push(`($1, $2, $${++i})`);
      values.push(userId);
    }

    // Create a job for each user.
    if (args.length) {
      // NOTE user id is only used for the temporary authentication
      const jobs = await client
        .query<{ id: string; userId: string }>(
          `
              insert into jobs(job_id, job_type, user_id) 
              values ${args.join(", ")}
              returning id, user_id as "userId"
              `,
          values,
        )
        .then((res) => res.rows);

      const body = jobs.map((job) => {
        const callback = new URL(
          `/api/v1/messages/jobs/${job.id}`,
          process.env.WEBHOOK_URL_BASE,
        );
        return {
          executeAt: scheduleAt,
          webhookAuth: job.userId,
          webhookUrl: callback.toString(),
        };
      });

      // Store interpolation key/values to base
      const interpolationKeys = Object.keys(template.interpolations);
      if (interpolationKeys.length) {
        const values = [scheduleBase.id];
        const args = [];

        let i = 1;
        for (const key of interpolationKeys) {
          args.push(`($1, $${++i}, $${++i})`);
          values.push(key, template.interpolations[key]);
        }

        await client.query(
          `
              insert into message_template_interpolations(message_by_template_id, interpolation_key, interpolation_value)
              values ${args.join(", ")}
              `,
          values,
        );
      }

      const url = new URL("/api/v1/tasks", process.env.SCHEDULER_API_URL);
      await fetch(url.toString(), {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "x-user-id": "tmp",
          "Content-Type": "application/json",
        },
      });
    }

    client.query("commit");
  } catch (err) {
    client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
};

export const getMessage = async (params: {
  pg: PostgresDb;
  userId: string;
  messageId: string;
}): Promise<ReadMessage> => {
  const data = await params.pg.query<ReadMessage>(
    `
        select 
            subject, 
            excerpt, 
            plain_text as "plainText",
            rich_text as "richText"
        from messages
        where user_id = $1 and id=$2
        order by created_at desc
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

export const getMessages = async (params: {
  pg: PostgresDb;
  userId: string;
  transportType?: string;
}): Promise<ReadMessages> => {
  let lifeEventType = "";
  if (params.transportType === "lifeEvent") {
    lifeEventType = `and preferred_transports @> '{"lifeEvent"}'`;
  }
  return (
    await params.pg.query(
      `
        select 
            id,
            subject, 
            excerpt, 
            plain_text as "plainText",
            rich_text as "richText",
            created_at as "createdAt"
        from messages
        where user_id = $1 and is_delivered = true
        ${lifeEventType}
        order by created_at desc
      `,
      [params.userId],
    )
  ).rows;
};

export const executeJob = async (params: {
  pg: PostgresDb;
  logger: FastifyBaseLogger;
  jobId: string;
  token: string;
  accessToken: string;
}) => {
  const statusWorking: scheduledMessageByTemplateStatus = "working";
  const statusDelivered: scheduledMessageByTemplateStatus = "delivered";
  let organizationId = ""; // lets get this from the jobs table
  let job:
    | {
        jobId: string;
        userId: string;
        type: JobType;
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
        type: JobType;
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
        params.accessToken,
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
  accessToken: string,
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

  const profileSdk = new Profile(accessToken);
  const messageSdk = {
    selectUsers(ids: string[]) {
      return getUserProfiles(ids, pool);
    },
  };

  const profileService = ProfileSdkFacade(profileSdk, messageSdk);

  const transportsClient = await pool.connect();
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

          const sent = await mailservice.sendMail({
            provider,
            email: user.email,
            subject: transportationSubject,
            body: transportationBody ?? "",
          });

          if (sent?.error) {
            // expand if we need more details.
            throw new Error();
          }
        } catch (err) {
          await eventLogger.log(MessagingEventType.emailError, [
            {
              messageId,
              messageKey: "failedToSend",
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
          where is_primary and organisation_id = $1
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
