import { FastifyInstance } from "fastify";
import { Type } from "@sinclair/typebox";

import { mailService } from "../providers/services";
import { utils, organisationId } from "../../utils";
import { awsSnsSmsService } from "../../services/sms/aws";

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
    messageType: string;
    message?: {
      threadName?: string;
      messageName: string;
      subject: string;
      excerpt: string;
      richText: string;
      plainText: string;
      links: string[];
      lang: string;
      paymentRequestId?: string;
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

export default async function messages(app: FastifyInstance) {
  app.post<{ Params: { id: string } }>(
    "/scheduled-message/:id",
    {},
    async function scheduledMessageHandler(request, reply) {
      const id = request.params.id;
      const client = await app.pg.connect();
      try {
        client.query("BEGIN");

        const messageUser = await client
          .query<{ userId: string; transports: string[] }>(
            `
          update messages set 
            is_delivered = true,
            updated_at = now()
          where id = $1
          returning user_id as "userId", preferred_transports as "transports"
        `,
            [id],
          )
          .then((res) => res.rows.at(0));

        // TODO get stuff for user id and send transports
        console.log({ messageUser });

        client.query("COMMIT");
      } catch (err) {
        console.log("fel vid commit i message delivery", err);
        client.query("ROLLBACK");
      } finally {
        client.release();
      }
    },
  );

  app.post<{ Params: { id: string } }>(
    "/scheduled-template/:id",
    {},
    async function scheduledTemplateHandler(request, reply) {
      const scheduledId = request.params.id;

      const templateMeta = await app.pg.pool
        .query<{
          id: string;
          preferredTransports: string[];
          security: string;
          messageType: string;
        }>(
          `
        select 
          template_meta_id as "id" ,
          preferred_transports as "preferredTransports",
          message_security as "security",
          message_type as "messageType"
        from scheduled_message_by_templates
        where id = $1
      `,
          [scheduledId],
        )
        .then((res) => res.rows.at(0));

      if (!templateMeta) {
        throw Error("failed to get scheduled template");
      }

      const userIds = await app.pg.pool
        .query<{ userId: string }>(
          `
        select user_id as "userId" from scheduled_message_by_template_users
        where message_by_template_id = $1
      `,
          [scheduledId],
        )
        .then((res) => res.rows.map((row) => row.userId));

      if (!userIds.length) {
        throw Error("failed to get users");
      }

      const templateContents = await app.pg.pool
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
        const error = utils.buildApiError(
          `no template for id ${templateMeta.id}`,
          400,
        );
        reply.statusCode = error.statusCode;
        return error;
      }

      // No users preference api (yet). Use this code when it's available
      // const languagesToConsider = users.reduce(
      //   utils.reduceUserLang,
      //   new Set<string>(),
      // );
      const languagesToConsider = new Set<string>(["en"]);
      const templates = templateContents.filter(
        utils.templateFilter(languagesToConsider),
      );

      // Each sub array of args is the full list of eg. [$1, $2, $5] per user/message. Goal is to join to a "($1,$2), ($1,$3) ..." string
      const valuesByLang: Record<
        string,
        { args: string[][]; values: (string | null)[]; initSize: number }
      > = {};

      // The interpolations will come from a table once we set to create a message from a scheduler
      const interpolationsBro = await app.pg.pool
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

      console.log(interpolationsBro);
      const interpolations = interpolationsBro.reduce<Record<string, string>>(
        function reducer(acc, pair) {
          acc[pair.key] = pair.value;
          return acc;
        },
        {},
      );

      const interpolationKeys = Object.keys(interpolations);
      const interpolationReducer = utils.interpolationReducer(interpolations);
      const baseargs: string[] = [];

      for (const template of templates) {
        const subject = interpolationKeys.reduce(
          interpolationReducer,
          template.subject,
        );

        const plainText = interpolationKeys.reduce(
          interpolationReducer,
          template.plainText,
        );

        const richText = interpolationKeys.reduce(
          interpolationReducer,
          template.richText,
        );

        const excerpt = interpolationKeys.reduce(
          interpolationReducer,
          template.excerpt,
        );

        // transportationSubject = subject;
        // transportationBody = richText || plainText;
        // transportationExcerpt = excerpt;

        // Values for each language insert
        const values = [
          "true",
          subject,
          excerpt,
          richText,
          plainText,
          template.lang,
          organisationId,
          templateMeta.security,
          subject, // message name, no idea what we're supposed to put here...
          subject, //thread name, no idea how this correlates with a template
          templateMeta.preferredTransports
            ? utils.postgresArrayify(templateMeta.preferredTransports)
            : null,
          templateMeta.messageType,
        ];

        const valuesSize = values.length;

        if (!baseargs.length) {
          baseargs.push(
            ...[...new Array(valuesSize)].map((_, i) => `$${i + 1}`),
          );
        }

        valuesByLang[template.lang] = {
          args: [],
          values,
          initSize: valuesSize,
        };

        let i = valuesByLang[template.lang].initSize;
        // gotta filter the users here on their preferred language...
        for (const userid of userIds) {
          valuesByLang[template.lang].values.push(userid);
          valuesByLang[template.lang].args.push([...baseargs, `$${i + 1}`]);
          i += 1;
        }

        const client = await app.pg.connect();
        let error: ReturnType<typeof utils.buildApiError> | undefined;
        try {
          await client.query("BEGIN");
          for (const lang of Object.keys(valuesByLang)) {
            let messageQuery = `
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
          )
          values ${valuesByLang[lang].args.map((arr) => `(${arr.join(", ")})`).join(", ")}
        `;

            await client.query(messageQuery, valuesByLang[lang].values);
          }
          await client.query("COMMIT");
        } catch (err) {
          await client.query("ROLLBACK");
          app.log.error(err);
          error = {
            message: "internal error",
            statusCode: 500,
          };
        } finally {
          client.release();
        }

        if (error) {
          reply.statusCode = error.statusCode;
          throw app.httpErrors.internalServerError(error.message);
        }

        reply.statusCode = 201;
      }
    },
  );

  // All messages
  app.get<GetAllMessages>(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Messages"],
        querystring: Type.Optional(
          Type.Object({
            type: Type.Optional(Type.String()),
          }),
        ),
        response: {
          200: Type.Object({
            data: Type.Array(
              Type.Object({
                id: Type.String(),
                subject: Type.String(),
                excerpt: Type.String(),
                plainText: Type.String(),
                richText: Type.String(),
                links: Type.Array(Type.String()),
                createdAt: Type.String(),
                messageType: Type.String(),
                paymentRequestId: Type.Optional(Type.String()),
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
        const { type } = request.query;

        let where = "";
        let argIndex = 2;
        const values: (string | number | null)[] = [];

        if (type) {
          where += `and message_type = $${argIndex}`;
          values.push(type);
          argIndex += 1;
        }

        const data = await app.pg
          .query<{
            id: string;
            subject: string;
            excerpt: string;
            plainText: string;
            richText: string;
            links: string[];
            createdAt: string;
            messageType: string;
            paymentRequestId?: string;
          }>(
            `
        select 
            id,
            subject, 
            excerpt, 
            plain_text as "plainText",
            rich_text as "richText",
            links,
            payment_request_id as "paymentRequestId",
            created_at as "createdAt",
            message_type as "messageType"
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
              links: Type.Array(Type.String()),
              paymentRequestId: Type.Optional(Type.String()),
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
          links: string[];
          paymentRequestId?: string;
        }>(
          `
          select 
            subject, 
            excerpt, 
            plain_text as "plainText",
            rich_text as "richText",
            links,
            payment_request_id as "paymentRequestId"
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
              links: Type.Array(Type.String()),
              lang: Type.String(),
              paymentRequestId: Type.Optional(Type.String({ format: "uuid" })),
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
          messageType: Type.String(),
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
        messageType,
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

      console.log("KOKOKO", template);

      let transportationSubject: string | undefined;
      let transportationBody: string | undefined;
      let transportationExcerpt: string | undefined;

      if (message) {
        const {
          links,
          messageName,
          threadName,
          paymentRequestId,
          excerpt,
          plainText,
          richText,
          subject,
          lang,
        } = message;
        transportationSubject = message.subject;
        transportationBody = message.richText ?? message.plainText;
        transportationExcerpt = message.excerpt;

        const values: (string | null)[] = [];
        const args: string[] = [];

        values.push(
          subject,
          excerpt,
          richText,
          plainText,
          links.length ? utils.postgresArrayify(links) : null,
          organisationId,
          security,
          preferredTransports.length
            ? utils.postgresArrayify(preferredTransports)
            : null,
          messageName,
          threadName || null,
          paymentRequestId || null,
          messageType,
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

        let insertQuery = `
            insert into messages(
                subject,
                excerpt, 
                rich_text,
                plain_text,
                links,
                organisation_id,
                security_level,
                preferred_transports,
                message_name,
                thread_name,
                payment_request_id,
                message_type,
                lang,
                user_id
            )
            values ${args.join(", ")}
            returning id, user_id as "userId"
        `;

        const ids = await app.pg
          .query<{ id: string; userId: string }>(insertQuery, values)
          .then((res) => res.rows);

        const url = new URL("/api/v1/tasks", "http://localhost:8004");
        await fetch(url.toString(), {
          method: "POST",
          body: JSON.stringify(
            ids.map((id) => {
              const callbackUrl = new URL(
                `/api/v1/messages/scheduled-message/${id.id}`,
                "http:localhost:8002",
              );

              return {
                webhookUrl: callbackUrl.toString(),
                webhookAuth: id.userId,
                executeAt: scheduleAt,
              };
            }),
          ),
        });
      } else if (template) {
        const client = await this.pg.pool.connect();

        try {
          client.query("begin");
          // Base
          const baseId = await client
            .query<{ id: string }>(
              `
                insert into scheduled_message_by_templates(template_meta_id, preferred_transports, message_type)
                values($1, $2, $3)
                returning id 
          `,
              [
                template.id,
                utils.postgresArrayify(preferredTransports),
                messageType,
              ],
            )
            .then((res) => res.rows.at(0));

          console.log("hoho? ", baseId);
          if (!baseId?.id) {
            throw Error(
              `failed to insert schedule message by template for template id ${template.id}`,
            );
          }

          const values: string[] = [baseId.id];
          const args: string[] = [];

          let i = 1;
          for (const userId of userIds) {
            args.push(`($1, $${++i})`);
            values.push(userId);
          }

          console.log(
            "users ids",
            values,
            `
          insert into scheduled_message_by_template_users(message_by_template_id, user_id)
          values ${args.join(", ")}
        `,
          );
          // Link users to base
          await client.query(
            `
              insert into scheduled_message_by_template_users(message_by_template_id, user_id)
              values ${args.join(", ")}
            `,
            values,
          );

          // Store interpolation key/values to base
          const interpolationKeys = Object.keys(template.interpolations);
          if (interpolationKeys.length) {
            const values = [baseId.id];
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

          const url = new URL("/api/v1/tasks", "http://localhost:8004");
          await fetch(url.toString(), {
            method: "POST",
            body: JSON.stringify(
              userIds.map((userId) => {
                const callbackUrl = new URL(
                  `/api/v1/messages/scheduled-template/${baseId.id}`,
                  "http:localhost:8002",
                );

                return {
                  webhookUrl: callbackUrl.toString(),
                  webhookAuth: userId,
                  executeAt: scheduleAt,
                };
              }),
            ),
          });

          client.query("commit");
        } catch (err) {
          console.log("failed to schedule template ", err);
          client.query("rollback");
        } finally {
          client.release();
        }
      }

      // for template, move all current logic to the yolo endpoint.
      // in here, we only insert template interpolation values attached to receivers.

      // for (const transport of preferredTransports) {
      //   if (transport === "email") {
      //     if (!transportationSubject) {
      //       console.error("no subject");
      //       continue;
      //     }

      //     const providerId =
      //       await mailService(app).getFirstOrEtherealMailProvider();

      //     try {
      //       void mailService(app).sendMails(
      //         providerId,
      //         ["ludwig.thurfjell@nearform.com"], // There's no api to get users atm?
      //         transportationSubject,
      //         transportationBody ?? "",
      //       );
      //     } catch (err) {
      //       app.log.error(err, "email");
      //     }
      //   } else if (transport === "sms") {
      //     if (!transportationExcerpt || !transportationSubject) {
      //       continue;
      //     }

      //     // todo proper query
      //     const config = await app.pg.pool
      //       .query<{ config: unknown }>(
      //         `
      //         select config from sms_providers
      //         limit 1
      //       `,
      //       )
      //       .then((res) => res.rows.at(0)?.config);

      //     if (utils.isSmsAwsConfig(config)) {
      //       const service = awsSnsSmsService(
      //         config.accessKey,
      //         config.secretAccessKey,
      //       );

      //       try {
      //         void service.Send(transportationExcerpt, transportationSubject, [
      //           "+46703835834",
      //         ]);
      //       } catch (err) {
      //         app.log.error(err, "sms");
      //       }
      //     }
      //   }
      // }
    },
  );
}
