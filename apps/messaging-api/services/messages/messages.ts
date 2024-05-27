import { PostgresDb } from "@fastify/postgres";
import {
  MessageInput,
  CreateMessage,
  CreateTranslatableMessage,
  ReadMessage,
  ReadMessages,
  DEFAULT_LANGUAGE,
} from "../../types/schemaDefinitions";
import { HttpError, ServiceError, organisationId, utils } from "../../utils";
import { createError } from "@fastify/error";
import { FastifyBaseLogger } from "fastify";
import { JobType } from "aws-sdk/clients/importexport";
import { Pool } from "pg";
import { mailService } from "../../routes/providers/services";
import { awsSnsSmsService } from "../sms/aws";
//import { Profile } from "building-blocks-sdk";

const EXECUTE_JOB_ERROR = "EXECUTE_JOB_ERROR";

export const createTranslatableMessage = async (params: {
  payload: CreateTranslatableMessage;
  pg: PostgresDb;
  requestUserId: string;
}): Promise<void> => {
  const { payload, requestUserId, pg } = params;
  const availableMessages = payload.messages as { [x: string]: MessageInput };
  const availableLanguages = Object.keys(availableMessages);

  const preferredLanguages = getUsersForLanguage({
    userIdsToSearchFor: payload.userIds,
    requestUserId: requestUserId,
  });
  const messagesSent: Promise<void>[] = [];

  for (const language of Object.keys(preferredLanguages)) {
    if (availableLanguages.includes(language)) {
      const toSent: CreateMessage = {
        ...payload,
        message: availableMessages[language],
        userIds: preferredLanguages[language],
      };
      messagesSent.push(createMessage({ payload: toSent, pg }));
    }
  }

  await Promise.all(messagesSent);
};

const getUsersForLanguage = (params: {
  userIdsToSearchFor: string[];
  requestUserId: string;
}): { [x: string]: string[] } => {
  if (params.userIdsToSearchFor.length === 0) {
    return {};
  }

  // Here I will invoke the user profile SDKS to get the preferred languages
  //const profileClient = new Profile(params.requestUserId);

  // Temporarily mocked
  return { [DEFAULT_LANGUAGE]: params.userIdsToSearchFor };
};

export const createMessage = async (params: {
  payload: CreateMessage;
  pg: PostgresDb;
}): Promise<void> => {
  if (params.payload.message) {
    return createSingleMessage({
      pg: params.pg,
      payload: { ...params.payload, message: params.payload.message! },
    });
  }

  if (params.payload.template) {
    return createMessageFromTemplate({
      pg: params.pg,
      payload: { ...params.payload, template: params.payload.template! },
    });
  }

  throw createError(
    "CREATE_MESSAGE_ERROR",
    "At least one between 'message' and 'template' must be set",
    400,
  )();
};

const createSingleMessage = async (params: {
  pg: PostgresDb;
  payload: Omit<Required<CreateMessage>, "template">;
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
    organisationId,
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

        console.log("yolo i interpolation ", values, args);
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
    throw createError(
      "GET_MESSAGE_ERROR",
      `No message with id ${params.messageId} for the logged in user does exist`,
      404,
    )();
  }

  return data.rows[0];
};

export const getMessages = async (params: {
  pg: PostgresDb;
  userId: string;
}): Promise<ReadMessages> => {
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
}) => {
  const statusWorking: scheduledMessageByTemplateStatus = "working";
  const statusDelivered: scheduledMessageByTemplateStatus = "delivered";

  let job:
    | {
        jobId: string;
        userId: string;
        type: JobType;
        status: scheduledMessageByTemplateStatus;
      }
    | undefined;

  const client = await params.pg.pool.connect();
  try {
    client.query("begin");
    const jobStatusResult = await client.query<{
      status: scheduledMessageByTemplateStatus;
    }>(
      `
        select coalesce(delivery_status, 'pending') as "status" from jobs where id = $1
        and case when delivery_status is not null then delivery_status != $2 else true end
    `,
      [params.jobId, statusDelivered],
    );

    if (!jobStatusResult.rowCount) {
      throw createError(EXECUTE_JOB_ERROR, "job doesn't exist", 404)();
    }

    const jobStatus = jobStatusResult.rows.at(0)?.status;

    if (jobStatus === "working") {
      throw createError(EXECUTE_JOB_ERROR, "job is already in progress", 400)();
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

    client.query("commit");
  } catch (err) {
    client.query("rollback");
    const msg = utils.isError(err) ? err.message : "failed to fetch job";
    throw createError(EXECUTE_JOB_ERROR, msg, 500)();
  } finally {
    client.release();
  }

  if (!job?.userId || !job.type) {
    throw createError(
      EXECUTE_JOB_ERROR,
      "job row missing critical fields",
      500,
    )();
  }

  let error: HttpError | undefined;
  if (job.type === "template") {
    try {
      const serviceErrors = await scheduledTemplate(
        params.pg.pool,
        job.jobId,
        job.userId,
      );
      for (const err of serviceErrors) {
        params.logger.error({ error: err.error }, err.msg);
      }

      const firstError = serviceErrors.filter((err) => err.critical).at(0);
      if (firstError) {
        error = createError(EXECUTE_JOB_ERROR, firstError.msg, 500)();
      }
    } catch (err) {
      const msg = utils.isError(err)
        ? err.message
        : "failed to create message from template job";
      error = createError(EXECUTE_JOB_ERROR, msg, 500)();
    }
  } else if (job.type === "message") {
    try {
      const serviceErrors = await scheduleMessage(
        params.pg.pool,
        job.jobId,
        job.userId,
      );

      for (const err of serviceErrors) {
        params.logger.error({ error: err.error }, err.msg);
      }

      const firstError = serviceErrors.filter((err) => err.critical).at(0);
      if (firstError) {
        error = createError(EXECUTE_JOB_ERROR, firstError.msg, 500)();
      }
    } catch (err) {
      const msg = utils.isError(err)
        ? err.message
        : "failed to create message job";
      error = createError(EXECUTE_JOB_ERROR, msg, 500)();
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
      const msg = utils.isError(err)
        ? err.message
        : "failed to update job delivery status";
      throw createError(EXECUTE_JOB_ERROR, msg, 500)();
    }

    throw createError(EXECUTE_JOB_ERROR, error.message, error.statusCode)();
  }
};

type scheduledMessageByTemplateStatus =
  | "pending"
  | "working"
  | "failed"
  | "delivered";

const scheduleMessage = async (
  pool: Pool,
  messageId: string,
  userId: string,
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
      throw new Error(`failed to find message for id ${messageId}`);
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

    // TODO send transports

    client.query("COMMIT");
  } catch (err) {
    client.query("ROLLBACK");
    const msg = utils.isError(err) ? err.message : "failed";
    errors.push({ error: { err }, msg, critical: true });
  } finally {
    client.release();
  }

  /**
   * There's a lot of logic to determine which transports, if any, to use
   * for each user.
   * eg.
   * Does user accept the preferred transport?
   * Which transport can we defer to?
   * Persist logs?
   * Fetch user information. Email and number
   */
  for (const transport of preferredTransports) {
    if (transport === "email") {
      if (!transportationSubject) {
        continue;
      }

      let providerId: string | undefined;
      try {
        // This is a big placeholder that needs proper logic
        providerId = await mailService(pool).getFirstOrEtherealMailProvider();

        await mailService(pool).sendMail({
          providerId,
          email: "",
          subject: transportationSubject,
          body: transportationBody ?? "",
        });
      } catch (err) {
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
      if (!transportationExcerpt || !transportationSubject) {
        continue;
      }

      // todo proper query
      const config = await pool
        .query<{ config: unknown }>(
          `
          select config from sms_providers
          limit 1
        `,
        )
        .then((res) => res.rows.at(0)?.config);

      if (utils.isSmsAwsConfig(config)) {
        const service = awsSnsSmsService(
          config.accessKey,
          config.secretAccessKey,
        );

        try {
          await service.Send(transportationExcerpt, "");
        } catch (err) {
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

  return errors;
};

const scheduledTemplate = async (
  pool: Pool,
  scheduledId: string,
  userId: string,
): Promise<ServiceError[]> => {
  const errors: ServiceError[] = [];

  const templateMeta = await pool
    .query<{
      id: string;
      preferredTransports: string[];
      security: string;
      messageType: string;
    }>(
      `
      select 
        template_meta_id as "id",
        message_security as "security",
        preferred_transports as "preferredTransports"
      from scheduled_message_by_templates
      where id = $1
  `,
      [scheduledId],
    )
    .then((res) => res.rows.at(0));

  if (!templateMeta) {
    // We log here and return 500 so scheduler can keep failing until max retries hit to signal further admin.
    errors.push({
      critical: true,
      error: { scheduledId, userId },
      msg: "failed to get any scheduled message by template",
    });
    return errors;
  }

  // Let's just get the language the user expects. Need to check the user api what they prefer
  // but also fallback if there's no template for the lang
  const templateContents = await pool
    .query<{
      subject: string;
      excerpt: string;
      richText: string;
      plainText: string;
      lang: string;
    }>(
      `
    select 
        subject, 
        excerpt, 
        rich_text as "richText", 
        plain_text as "plainText",
        lang
    from message_template_contents
    where template_meta_id = $1 
    `,
      [templateMeta.id],
    )
    .then((res) => res.rows);

  if (!templateContents.length) {
    errors.push({
      critical: true,
      error: {
        userId,
        templateMeta,
      },
      msg: "failed to find a template for meta id",
    });

    return errors;
  }

  // TODO some kind of default logic here
  const templateContent =
    templateContents.find((tmpl) => tmpl?.lang === "en") ??
    templateContents.at(0)!; // We know there's items in the list at this point.

  // The interpolations will come from a table once we set to create a message from a scheduler
  const interpolationsResult = await pool
    .query<{
      key: string;
      value: string;
    }>(
      `
    select 
      interpolation_key as "key", 
      interpolation_value as "value" 
    from message_template_interpolations
    where message_by_template_id = $1
  `,
      [scheduledId],
    )
    .then((res) => res.rows);

  const interpolations = interpolationsResult.reduce<Record<string, string>>(
    function reducer(acc, pair) {
      acc[pair.key] = pair.value;
      return acc;
    },
    {},
  );

  const interpolationKeys = Object.keys(interpolations);
  const interpolationReducer = utils.interpolationReducer(interpolations);

  const subject = interpolationKeys.reduce(
    interpolationReducer,
    templateContent.subject,
  );

  const plainText = interpolationKeys.reduce(
    interpolationReducer,
    templateContent.plainText,
  );

  const richText = interpolationKeys.reduce(
    interpolationReducer,
    templateContent.richText,
  );

  const excerpt = interpolationKeys.reduce(
    interpolationReducer,
    templateContent.excerpt,
  );

  const transportationSubject = subject;
  const transportationBody = richText || plainText;
  const transportationExcerpt = excerpt;

  // Values for each language insert
  const values = [
    "true",
    subject,
    excerpt,
    richText,
    plainText,
    templateContent.lang,
    organisationId,
    templateMeta.security,
    subject, // message name, no idea what we're supposed to put here...
    subject, //thread name, no idea how this correlates with a template
    templateMeta.preferredTransports
      ? utils.postgresArrayify(templateMeta.preferredTransports)
      : null,
    userId,
  ];

  // A job is tied to one user.
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `
        insert into messages(
          is_delivered,
          subject,
          excerpt, 
          rich_text,
          plain_text,
          lang,
          organisation_id,
          security_level,
          message_name,
          thread_name,
          preferred_transports,
          user_id
        ) values (${values.map((_, i) => `$${i + 1}`).join(", ")})
    `,
      values,
    );

    const statusDelivered: scheduledMessageByTemplateStatus = "delivered";
    await client.query(
      `
          update jobs set delivery_status = $1
          where job_id = $2
      `,
      [statusDelivered, scheduledId],
    );

    await client.query("COMMIT");
  } catch (err) {
    errors.push({
      critical: true,
      error: { err },
      msg: "failed to create message from template",
    });
    // error = utils.buildApiError("failed to create message from template", 500);
    await client.query("ROLLBACK");
  } finally {
    client.release;
  }

  /**
   * There's a lot of logic to determine which transports, if any, to use
   * for each user.
   * eg.
   * Does user accept the preferred transport?
   * Which transport can we defer to?
   * Persist logs?
   * Fetch user information. Email and number
   */
  for (const transport of templateMeta.preferredTransports) {
    if (transport === "email") {
      if (!transportationSubject) {
        continue;
      }

      let providerId: string | undefined;
      try {
        // This is a big placeholder that needs proper logic
        providerId = await mailService(pool).getFirstOrEtherealMailProvider();

        void mailService(pool).sendMail({
          providerId,
          email: "",
          subject: transportationSubject,
          body: transportationBody ?? "",
        });
      } catch (err) {
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
      if (!transportationExcerpt || !transportationSubject) {
        continue;
      }

      // todo proper query
      const config = await pool
        .query<{ config: unknown }>(
          `
          select config from sms_providers
          limit 1
        `,
        )
        .then((res) => res.rows.at(0)?.config);

      if (utils.isSmsAwsConfig(config)) {
        const service = awsSnsSmsService(
          config.accessKey,
          config.secretAccessKey,
        );

        try {
          await service.Send(transportationExcerpt, "");
        } catch (err) {
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

  return errors;
};
