import { FastifyInstance } from "fastify";
import { Static, Type } from "@sinclair/typebox";
import { HttpError } from "../../types/httpErrors";
import { OurHttpError, utils } from "../../tmp_utils";
import { randomUUID } from "crypto";
import { mailService } from "../providers/services";

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
      links: string[];
      paymentRequestId?: string;
    };
    template?: {
      id: string;
      interpolations: Record<string, string>;
    };
    preferredTransports: string[];
    userIds: string[];
    security: string;
  };
}

export default async function messages(app: FastifyInstance) {
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
    async function (request, reply) {
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
        where user_id = $1 
        ${where}
        order by created_at desc
      `,
            [userId, ...values],
          )
          .then((res) => res.rows);

        return { data };
      } catch (err) {
        // I guess we're gonna do some reporting with these errors?
        const error: Static<typeof HttpError> = {
          code: "no idea what this is supposed to be",
          error: "failed to fetch messages",
          message: "idk bro",
          statusCode: 500,
          time: new Date().toISOString(),
        };
        throw app.httpErrors.internalServerError(error.message);
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
    async function handler(request, reply) {
      const userId = request.user?.id;
      if (!userId) {
        throw app.httpErrors.unauthorized();
      }

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
        reply.statusCode = 404;
        const errorStruct: OurHttpError = {
          statusCode: 404,
          message: "no message found",
        };
        return errorStruct;
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
        }),
        response: {
          "4xx": { $ref: "HttpError" },
          "5xx": { $ref: "HttpError" },
        },
      },
    },
    async function handler(request, reply) {
      const { message, template, preferredTransports, security } = request.body;
      if (!message && !template) {
        reply.statusCode = 400;
        return {
          statusCode: 400,
          message: "body must contain either a message or a template object",
        };
      }

      // Temp variables
      const users = ["8bbad040-cc08-432c-82de-c6341d4b5ff9"];
      const organisationId = randomUUID().toString();

      let mailSubject: string | undefined;
      let mailBody: string | undefined;

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
        } = message;
        mailSubject = message.subject;
        mailBody = message.richText ?? message.plainText;

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
        );
        const originalValueSize = values.length;

        let i = originalValueSize + 1;
        for (const userId of users) {
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
                user_id
            )
            values ${args.join(", ")}
        `;

        await app.pg.query(insertQuery, values);
      } else if (template) {
        const templateContents = await app.pg
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
            [template.id],
          )
          .then((res) => res.rows);

        if (!templateContents.length) {
          reply.statusCode = 400;
          return {
            statusCode: 400,
            message: `no template for id ${template.id}`,
          };
        }

        // const languagesToConsider = users.reduce(
        //   utils.reduceUserLang,
        //   new Set<string>(),
        // );
        const languagesToConsider = new Set<string>(["en"]);
        const templates = templateContents.filter(
          utils.templateFilter(languagesToConsider),
        );

        const valuesByLang: Record<
          string,
          { args: string[][]; values: (string | null)[]; initSize: number }
        > = {};
        const interpolations = template.interpolations;
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

          mailSubject = subject;
          mailBody = richText ?? plainText;

          // Values for each language insert
          const values = [
            subject,
            excerpt,
            richText,
            plainText,
            template.lang,
            randomUUID().toString(), /// organisation id
            security,
            subject, // message name, no idea what we're supposed to put here...
            subject, //thread name, no idea how this correlates with a template
            preferredTransports
              ? utils.postgresArrayify(preferredTransports)
              : null,
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

          const client = await app.pg.connect();
          let error: OurHttpError | undefined;
          try {
            await client.query("BEGIN");
            for (const lang of Object.keys(valuesByLang)) {
              let messageQuery = `
              insert into messages(
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
            return error;
          }

          reply.statusCode = 201;
          return;
        }
      }

      if (preferredTransports.includes("email")) {
        if (!mailSubject || !mailBody) {
          console.error("no subject or body");
          return;
        }

        const providerId =
          await mailService(app).getFirstOrEtherealMailProvider();

        void mailService(app).sendMails(
          providerId,
          ["ludwig.thurfjell@nearform.com"],
          mailSubject,
          mailBody,
        );
      }
    },
  );
}
