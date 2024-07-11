import { Type } from "@sinclair/typebox";
import { FastifyInstance } from "fastify";
import { organisationId } from "../../utils";
import { BadRequestError, NotFoundError, ServerError } from "shared-errors";
const tags = ["Templates"];

const TEMPLATES_ERROR = "TEMPLATES_ERROR";

type TemplateVariable = { name: string; type: string; languages: string[] };
interface CreateTemplate {
  Body: {
    contents: {
      templateName: string;
      lang: string;
      subject: string;
      excerpt: string;
      richText: string;
      plainText: string;
    }[];
    variables: TemplateVariable[];
  };
}

interface UpdateTemplate {
  Body: {
    contents: {
      id: string;
      templateName: string;
      lang: string;
      subject: string;
      excerpt: string;
      richText: string;
      plainText: string;
    }[];
    variables: TemplateVariable[];
  };
  Params: {
    templateId: string;
  };
}

interface GetTemplates {
  Querystring?: {
    lang?: string;
  };
}

interface GetTemplate {
  Querystring: {
    lang?: string;
  };
  Params: {
    templateId: string;
  };
}

const TemplateTypeWithoutId = Type.Object({
  templateName: Type.String(),
  lang: Type.String(),
  subject: Type.String(),
  excerpt: Type.String(),
  plainText: Type.String(),
  richText: Type.String(),
});

const TemplateType = Type.Object({
  id: Type.String({ format: "uuid" }),
  templateName: Type.String(),
  lang: Type.String(),
  subject: Type.String(),
  excerpt: Type.String(),
  plainText: Type.String(),
  richText: Type.String(),
});

export default async function templates(app: FastifyInstance) {
  app.get<GetTemplates>(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        querystring: Type.Optional(
          Type.Object({
            lang: Type.Optional(Type.String()),
          }),
        ),
        tags,
        response: {
          200: Type.Object({
            data: Type.Array(
              Type.Object({
                templateMetaId: Type.String({ format: "uuid" }),
                contents: Type.Array(
                  Type.Object({
                    lang: Type.String(),
                    templateName: Type.String(),
                  }),
                ),
              }),
            ),
          }),
          "4xx": { $ref: "HttpError" },
          "5xx": { $ref: "HttpError" },
        },
      },
    },
    async function handleGetAll(request, _reply) {
      const lang = request.query?.lang || "";

      const result = await app.pg.pool.query<{
        templateMetaId: string;
        lang: string;
        templateName: string;
      }>(
        `
        select  
          m.id as "templateMetaId",
          c.lang,
          template_name as "templateName"
        from message_template_meta m
        join message_template_contents c on c.template_meta_id = m.id
        where 
          case when length($1) > 0 then lang=$1 else true end
          order by c.created_at desc
      `,
        [lang],
      );

      const data: {
        templateMetaId: string;
        contents: { templateName: string; lang: string }[];
      }[] = [];

      for (const row of result.rows) {
        const content = { lang: row.lang, templateName: row.templateName };
        data
          .find((item) => item.templateMetaId === row.templateMetaId)
          ?.contents.push(content) ||
          data.push({
            templateMetaId: row.templateMetaId,
            contents: [content],
          });
      }

      return { data };
    },
  );

  app.get<GetTemplate>(
    "/:templateId",
    {
      preValidation: app.verifyUser,
      schema: {
        tags,
        response: {
          200: Type.Object({
            data: Type.Object({
              contents: Type.Array(
                Type.Object({
                  templateName: Type.String(),
                  subject: Type.String(),
                  excerpt: Type.String(),
                  plainText: Type.String(),
                  richText: Type.String(),
                  lang: Type.String(),
                }),
              ),
              fields: Type.Array(
                Type.Object({
                  fieldName: Type.String(),
                  fieldType: Type.String(),
                }),
              ),
            }),
          }),
          404: { $ref: "HttpError" },
          "5xx": { $ref: "HttpError" },
        },
      },
    },
    async function handleGetOne(request, _reply) {
      const templateId = request.params.templateId;

      const templateMeta = await app.pg.pool.query<{
        templateName: string;
        subject: string;
        excerpt: string;
        plainText: string;
        richText: string;
        lang: string;
        fieldName?: string;
        fieldType?: string;
      }>(
        `
            select
              template_name as "templateName",
              subject,
              excerpt,
              plain_text as "plainText",
              rich_text as "richText",
              lang,
              v.field_name as "fieldName",
              v.field_type as "fieldType"
            from message_template_meta m
            join message_template_contents c on c.template_meta_id = m.id
            left join message_template_variables v on v.template_meta_id = m.id
            where m.id = $1
      `,
        [templateId],
      );

      const template: {
        contents: {
          templateName: string;
          subject: string;
          excerpt: string;
          plainText: string;
          richText: string;
          lang: string;
        }[];
        fields: { fieldName: string; fieldType: string }[];
      } = {
        contents: [],
        fields: [],
      };

      for (const row of templateMeta.rows) {
        const {
          excerpt,
          plainText,
          richText,
          subject,
          templateName,
          fieldName,
          fieldType,
          lang,
        } = row;

        const content = template.contents?.find(
          (content) => content.lang === lang,
        );

        if (content) {
          content.excerpt = excerpt;
          content.excerpt = excerpt;
          content.plainText = plainText;
          content.richText = richText;
          content.subject = subject;
          content.templateName = templateName;
        } else {
          template.contents.push({
            excerpt,
            lang,
            plainText,
            richText,
            subject,
            templateName,
          });
        }

        if (
          fieldName &&
          !template.fields.some((field) => field.fieldName === fieldName)
        ) {
          template.fields.push({ fieldName, fieldType: fieldType ?? "" });
        }
      }

      if (!template.contents.length) {
        throw new NotFoundError(TEMPLATES_ERROR, "no template found");
      }

      return { data: template };
    },
  );

  app.post<CreateTemplate>(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        tags,
        body: Type.Object({
          contents: Type.Array(TemplateTypeWithoutId),
          variables: Type.Array(
            Type.Object({
              name: Type.String(),
              type: Type.String(),
              languages: Type.Array(Type.String()),
            }),
          ),
        }),
        response: {
          "5xx": { $ref: "HttpError" },
          "4xx": { $ref: "HttpError" },
          201: Type.Object({
            data: Type.Object({
              id: Type.String({ format: "uuid" }),
            }),
          }),
        },
      },
    },
    async function handleCreate(request, reply) {
      const userId = request.userData!.userId;

      const { contents, variables } = request.body;

      let templateMetaId: string | undefined;
      // Can of course create a huge CTE here.
      const client = await app.pg.pool.connect();
      try {
        client.query("BEGIN");

        // Let's check so that the template name isn't taken for the organisation
        const templateNameExists = await client.query<{ exists: boolean }>(
          `
          select exists(select 1 from message_template_meta m 
            join message_template_contents c on c.template_meta_id = m.id
            where organisation_id = $1
            and LOWER(template_name) in ($2)
            limit 1);
        `,
          [
            organisationId,
            contents
              .map((content) => content.templateName.toLowerCase())
              .join(", "),
          ],
        );

        if (templateNameExists.rows[0]?.exists) {
          throw new BadRequestError(
            TEMPLATES_ERROR,
            "template name already exists",
          );
        }

        const templateMetaResponse = await client.query<{ id: string }>(
          `
          insert into message_template_meta(organisation_id, created_by_user_id)
          values($1,$2)
          returning id
        `,
          [organisationId, userId],
        );
        templateMetaId = templateMetaResponse.rows.at(0)?.id;

        if (!templateMetaId) {
          throw new ServerError(
            TEMPLATES_ERROR,
            "failed to create a template meta",
          );
        }

        for (const content of contents) {
          const { excerpt, lang, templateName, plainText, richText, subject } =
            content;
          await client.query(
            `
            insert into message_template_contents(
              template_meta_id, 
              template_name,
              lang,
              subject,
              excerpt,
              rich_text,
              plain_text
              )
            values(
              $1,$2,$3,$4,$5,$6,$7
            )
          `,
            [
              templateMetaId,
              templateName,
              lang,
              subject,
              excerpt,
              richText,
              plainText,
            ],
          );
        }

        for (const field of variables) {
          await client.query(
            `
            insert into message_template_variables(template_meta_id, field_name, field_type)
            values($1, $2, $3)
          `,
            [templateMetaId, field.name, field.type],
          );
        }
        await client.query("COMMIT");
      } catch (err) {
        client.query("ROLLBACK");
        if (err instanceof Error) {
          this.log.error(err.message);
        }
        throw new ServerError(TEMPLATES_ERROR, "failed to create template");
      } finally {
        client.release();
      }

      reply.statusCode = 201;
      return { data: { id: templateMetaId } };
    },
  );

  app.put<UpdateTemplate>(
    "/:templateId",
    {
      preValidation: app.verifyUser,
      schema: {
        tags,
        body: Type.Object({
          contents: Type.Array(TemplateType),
          variables: Type.Array(
            Type.Object({
              name: Type.String(),
              type: Type.String(),
            }),
          ),
        }),
        response: {
          "4xx": { $ref: "HttpError" },
          "5xx": { $ref: "HttpError" },
        },
      },
    },
    async function handleUpdate(request, _reply) {
      const templateId = request.params.templateId;
      const { contents, variables } = request.body;

      const client = await app.pg.pool.connect();
      try {
        client.query("BEGIN");

        await client.query(
          `
          delete from message_template_contents
          where template_meta_id = $1
        `,
          [templateId],
        );
        for (const content of contents) {
          const { excerpt, lang, templateName, plainText, richText, subject } =
            content;
          const values = [
            templateId,
            templateName,
            lang,
            subject,
            excerpt,
            richText,
            plainText,
          ];

          const args = [...new Array(values.length)].map((_, i) => `$${i + 1}`);
          await client.query(
            `
                insert into message_template_contents(
                    template_meta_id,
                    template_name,
                    lang,
                    subject,
                    excerpt,
                    rich_text, 
                    plain_text
                ) values(
                 ${args.join(", ")}   
                )
            `,
            values,
          );
        }

        // Flush all variables and re-insert. Easier than figuring out which has been modified, added or removed
        await client.query(
          `
          delete from message_template_variables
          where template_meta_id = $1
        `,
          [templateId],
        );

        for (const variable of variables) {
          const values = [templateId, variable.name, variable.type];
          await client.query(
            `
            insert into message_template_variables(template_meta_id, field_name, field_type)
            values($1, $2, $3)
            on conflict(template_meta_id, field_name) do update set
            field_name = $2,
            field_type = $3
            where message_template_variables.template_meta_id = $1 and message_template_variables.field_name = $2
          `,
            values,
          );
        }
        await client.query("COMMIT");
      } catch (err) {
        client.query("ROLLBACK");
        throw new ServerError(TEMPLATES_ERROR, "failed to update");
      } finally {
        client.release();
      }
    },
  );
  app.delete<GetTemplate>(
    "/:templateId",
    {
      preValidation: app.verifyUser,
      schema: {
        tags,
        response: {
          "4xx": { $ref: "HttpError" },
          "5xx": { $ref: "HttpError" },
        },
      },
    },
    async function handleDelete(request, _reply) {
      const templateId = request.params.templateId;

      await app.pg.pool.query(
        `
        with variables as (
            delete from message_template_variables
            where template_meta_id = $1
        ), contents as (
            delete from message_template_contents
            where template_meta_id = $1
        )
        delete from message_template_meta
        where id = $1
      `,
        [templateId],
      );
    },
  );
}
