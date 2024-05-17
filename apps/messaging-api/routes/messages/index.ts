import { FastifyInstance } from "fastify";
import { Type } from "@sinclair/typebox";
import { mailService } from "../providers/services";
import { utils, organisationId, HttpError, ServiceError } from "../../utils";
import { awsSnsSmsService } from "../../services/sms/aws";
import { Pool } from "pg";

type scheduledMessageByTemplateStatus =
  | "pending"
  | "working"
  | "failed"
  | "delivered";

async function scheduleMessage(
  pool: Pool,
  messageId: string,
  userId: string,
): Promise<ServiceError[]> {
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
}

async function scheduledTemplate(
  pool: Pool,
  scheduledId: string,
  userId: string,
): Promise<ServiceError[]> {
  const errors: ServiceError[] = [];

  let transportationSubject: string | undefined;
  let transportationBody: string | undefined;
  let transportationExcerpt: string | undefined;

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
        preferred_transports as "preferredTransports",
        message_type as "messageType"
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

  transportationSubject = subject;
  transportationBody = richText || plainText;
  transportationExcerpt = excerpt;

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
    templateMeta.messageType,
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
          message_type,
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
}

interface GetAllMessages {
  Querystring: {
    type?: string;
  };
}

interface GetMessage {
  Params: {
    messageId: string;
  };
}

interface CreateMessage {
  Body: {
    message?: {
      threadName?: string;
      messageName: string;
      subject: string;
      excerpt: string;
      richText: string;
      plainText: string;
      lang: string;
    };
    template?: {
      id: string;
      interpolations: Record<string, string>;
    };
    preferredTransports: string[];
    userIds: string[];
    security: string;
    scheduleAt: string;
  };
}

type JobType = "message" | "template";

export default async function messages(app: FastifyInstance) {
  app.post<{ Params: { id: string } }>(
    "/jobs/:id",
    {
      preValidation: app.verifyUser,
      schema: {
        response: {
          202: Type.Null(),
          "5xx": { $ref: "HttpError" },
          "4xx": { $ref: "HttpError" },
        },
      },
    },
    async function jobHandler(request, reply) {
      const jobId = request.params.id;
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

      const client = await app.pg.pool.connect();
      try {
        client.query("begin");
        const jobStatusResult = await client.query<{
          status: scheduledMessageByTemplateStatus;
        }>(
          `
          select coalesce(delivery_status, 'pending') as "status" from jobs where id = $1
          and case when delivery_status is not null then delivery_status != $2 else true end
      `,
          [jobId, statusDelivered],
        );

        if (!jobStatusResult.rowCount) {
          throw new Error("job doesn't exist");
        }

        const jobStatus = jobStatusResult.rows.at(0)?.status;

        if (jobStatus === "working") {
          throw new Error("job is already in progress");
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
            [statusWorking, jobId],
          )
          .then((res) => res.rows.at(0));

        client.query("commit");
      } catch (err) {
        const msg = utils.isError(err) ? err.message : "failed to fetch job";
        app.log.error({ jobId, err }, msg);
        client.query("rollback");
      } finally {
        client.release();
      }

      if (!job?.userId || !job.type) {
        app.log.error({ jobId, job }, "job row missing critical fields");
        reply.statusCode = 500;
        return;
      }

      let error: HttpError | undefined;
      if (job.type === "template") {
        try {
          const serviceErrors = await scheduledTemplate(
            app.pg.pool,
            job.jobId,
            job.userId,
          );
          for (const err of serviceErrors) {
            app.log.error(err.error, err.msg);
          }

          const firstError = serviceErrors.filter((err) => err.critical).at(0);
          if (firstError) {
            error = utils.buildApiError(firstError.msg, 500);
          }
        } catch (err) {
          const msg = utils.isError(err)
            ? err.message
            : "failed to create message from template job";
          error = utils.buildApiError(msg, 500);
        }
      } else if (job.type === "message") {
        try {
          const serviceErrors = await scheduleMessage(
            app.pg.pool,
            job.jobId,
            job.userId,
          );

          for (const err of serviceErrors) {
            app.log.error(err.error, err.msg);
          }

          const firstError = serviceErrors.filter((err) => err.critical).at(0);
          if (firstError) {
            error = utils.buildApiError(firstError.msg, 500);
          }
        } catch (err) {
          const msg = utils.isError(err)
            ? err.message
            : "failed to create message job";
          error = utils.buildApiError(msg, 500);
        }
      }

      if (error) {
        app.log.error({ job, jobId }, error.message);
        const statusFailed: scheduledMessageByTemplateStatus = "failed";
        try {
          await app.pg.pool.query(
            `
            update jobs set delivery_status = $1
            where id = $2
            `,
            [statusFailed, jobId],
          );
        } catch (err) {
          const msg = utils.isError(err)
            ? err.message
            : "failed to update job devliery status";
          app.log.error(
            { job, jobId, expectedDeliveryStatus: statusFailed },
            msg,
          );
        }
        reply.statusCode = error.statusCode;
        return;
      }

      reply.statusCode = 202;
      return;
    },
  );

  // All messages
  app.get<GetAllMessages>(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Messages"],
        querystring: Type.Optional(Type.Object({})),
        response: {
          200: Type.Object({
            data: Type.Array(
              Type.Object({
                id: Type.String(),
                subject: Type.String(),
                excerpt: Type.String(),
                plainText: Type.String(),
                richText: Type.String(),
                createdAt: Type.String(),
              }),
            ),
          }),
          400: { $ref: "HttpError" },
        },
      },
    },
    async function getMessagesHandler(request, reply) {
      // Validation?
      const userId = request.user?.id;

      try {
        const values: (string | number | null)[] = [];

        const data = await app.pg
          .query<{
            id: string;
            subject: string;
            excerpt: string;
            plainText: string;
            richText: string;
            createdAt: string;
          }>(
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
        ${where}
        order by created_at desc
      `,
            [userId, ...values],
          )
          .then((res) => res.rows);

        return { data };
      } catch (err) {
        const error = utils.buildApiError("failed to get all messages", 500);
        reply.statusCode = error.statusCode;
        return error;
      }
    },
  );

  // Message by id
  app.get<GetMessage>(
    "/:messageId",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Messages"],
        params: {
          messageId: Type.String({
            format: "uuid",
          }),
        },
        response: {
          200: Type.Object({
            data: Type.Object({
              subject: Type.String(),
              excerpt: Type.String(),
              plainText: Type.String(),
              richText: Type.String(),
            }),
          }),
          "4xx": { $ref: "HttpError" },
          "5xx": { $ref: "HttpError" },
        },
      },
    },
    async function getMessageHandler(request, reply) {
      const userId = request.user?.id;

      const data = await app.pg
        .query<{
          subject: string;
          excerpt: string;
          plainText: string;
          richText: string;
        }>(
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
          [userId, request.params.messageId],
        )
        .then((res) => res.rows.at(0));

      if (!data) {
        const error = utils.buildApiError("no mesage found", 404);
        reply.statusCode = error.statusCode;
        return error;
      }

      return { data };
    },
  );

  // Message create
  app.post<CreateMessage>(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Messages"],
        body: Type.Object({
          message: Type.Optional(
            Type.Object({
              threadName: Type.Optional(Type.String()),
              messageName: Type.String(),
              subject: Type.String(),
              excerpt: Type.String(),
              richText: Type.String(),
              plainText: Type.String(),
              lang: Type.String(),
            }),
          ),
          template: Type.Optional(
            Type.Object({
              id: Type.String({ format: "uuid" }),
              interpolations: Type.Record(Type.String(), Type.String()),
            }),
          ),
          preferredTransports: Type.Array(Type.String()),
          userIds: Type.Array(Type.String({ format: "uuid" })),
          security: Type.String(),
          scheduleAt: Type.String({ format: "date-time" }),
        }),
        response: {
          "4xx": { $ref: "HttpError" },
          "5xx": { $ref: "HttpError" },
        },
      },
    },
    async function createMessageHandler(request, reply) {
      const {
        message,
        template,
        preferredTransports,
        security,
        userIds,
        scheduleAt,
      } = request.body;

      if (!message && !template) {
        const error = utils.buildApiError(
          "body must contain either a message or a template object",
          400,
        );
        reply.statusCode = error.statusCode;
        return error;
      }

      if (message) {
        const {
          messageName,
          threadName,
          excerpt,
          plainText,
          richText,
          subject,
          lang,
        } = message;

        const values: (string | null)[] = [];
        const args: string[] = [];

        values.push(
          subject,
          excerpt,
          richText,
          plainText,
          organisationId,
          security,
          preferredTransports.length
            ? utils.postgresArrayify(preferredTransports)
            : null,
          messageName,
          threadName || null,
          lang,
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

        const ids = await app.pg
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

        const jobs = await app.pg.pool
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
      } else if (template) {
        const client = await this.pg.pool.connect();

        try {
          client.query("begin");

          const scheduleBase = await client
            .query<{ id: string }>(
              `
                insert into scheduled_message_by_templates(template_meta_id, preferred_transports)
                values($1, $2, $3)
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
          app.log.error({ err }, "failed to create message from template");
          client.query("rollback");
        } finally {
          client.release();
        }
      }
    },
  );
}
