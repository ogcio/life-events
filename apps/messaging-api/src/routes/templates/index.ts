import { Type } from "@sinclair/typebox";
import { FastifyInstance } from "fastify";
import {
  isLifeEventsError,
  NotFoundError,
  ServerError,
  ValidationError,
} from "shared-errors";
import { Permissions } from "../../types/permissions.js";
import { HttpError } from "../../types/httpErrors.js";
import {
  getGenericResponseSchema,
  PaginationParams,
  PaginationParamsSchema,
  TypeboxStringEnum,
} from "../../types/schemaDefinitions.js";
import {
  ensureOrganizationIdIsSet,
  ensureUserIdIsSet,
} from "../../utils/authentication-factory.js";
import {
  formatAPIResponse,
  sanitizePagination,
} from "../../utils/pagination.js";

const tags = ["Templates"];

type TemplateVariable = { name: string };
interface CreateTemplate {
  Body: {
    contents: {
      templateName: string;
      language: string;
      subject: string;
      excerpt: string;
      richText: string;
      plainText: string;
    }[];
    variables?: TemplateVariable[];
  };
}

interface UpdateTemplate {
  Body: {
    contents: {
      templateName: string;
      language: string;
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
  Querystring: {
    lang?: string;
  } & PaginationParams;
}

interface GetTemplate {
  Querystring: {
    lang?: string;
  };
  Params: {
    templateId: string;
  };
}

const TemplateContentType = Type.Object({
  templateName: Type.String({
    description: "Template name for the related language",
    minLength: 1,
  }),
  language: TypeboxStringEnum(
    ["en", "ga"],
    undefined,
    "Template content language",
  ),
  subject: Type.String({
    description: "Subject of the template",
    minLength: 1,
  }),
  excerpt: Type.String({
    description: "Brief description of the template content",
    minLength: 1,
  }),
  plainText: Type.String({
    description: "Plain text version of the template",
    minLength: 1,
  }),
  richText: Type.String({
    description: "Rich text version of the template",
    minLength: 1,
  }),
});

export default async function templates(app: FastifyInstance) {
  app.get<GetTemplates>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Template.Read]),
      schema: {
        description: "Returns the providers matching the requested query",
        querystring: Type.Optional(PaginationParamsSchema),
        tags,
        response: {
          200: getGenericResponseSchema(
            Type.Array(
              Type.Object({
                id: Type.String({
                  format: "uuid",
                  description: "Unique id of the template",
                }),
                contents: Type.Array(
                  Type.Object({
                    language: TypeboxStringEnum(
                      ["en", "ga"],
                      undefined,
                      "Template content language",
                    ),
                    templateName: Type.String({
                      description: "Template name for the related language",
                    }),
                  }),
                ),
              }),
            ),
          ),
          "4xx": HttpError,
          "5xx": HttpError,
        },
      },
    },
    async function handleGetAll(request, _reply) {
      const errorProcess = "TEMPLATES_GET_ALL";

      const organisationId = ensureOrganizationIdIsSet(request, errorProcess);
      const { limit, offset } = sanitizePagination({
        limit: request.query.limit,
        offset: request.query.offset,
      });

      const result = await app.pg.pool.query<{
        templateMetaId: string;
        contents: { language: string; templateName: string }[];
        count: number;
      }>(
        `
        with meta_count as(
          select count(*) from message_template_meta
          where 
            organisation_id = $1 
            and deleted_at is null
        )
        select  
          m.id as "templateMetaId",
          (select jsonb_agg(jsonb_build_object('templateName', template_name, 'language', c.lang)) from message_template_contents c where template_meta_id = id) as "contents",
          (select count from meta_count) as "count"
        from message_template_meta m
        where
          organisation_id = $1 and
          m.deleted_at is null
          limit $2
          offset $3
      `,
        [organisationId, limit, offset],
      );

      const data: {
        id: string;
        contents: { templateName: string; language: string }[];
      }[] = [];

      for (const row of result.rows) {
        data.push({ id: row.templateMetaId, contents: row.contents });
      }

      const totalCount = result.rows.at(0)?.count || 0;

      return formatAPIResponse({ data, request, totalCount });
    },
  );

  app.get<GetTemplate>(
    "/:templateId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Template.Read]),
      schema: {
        description: "Returns the requested template",
        tags,
        params: {
          templateId: Type.String({ format: "uuid" }),
        },
        response: {
          200: getGenericResponseSchema(
            Type.Object({
              contents: Type.Array(TemplateContentType),
              fields: Type.Array(
                Type.Object(
                  {
                    fieldName: Type.String(),
                  },
                  {
                    description:
                      "List of the variables that are needed to be filled to create a message using this template",
                  },
                ),
              ),
            }),
          ),
          404: HttpError,
          "5xx": HttpError,
        },
      },
    },
    async function handleGetOne(request, _reply) {
      return { data: await getTemplate(app, request.params.templateId) };
    },
  );

  app.post<CreateTemplate>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Template.Write]),
      schema: {
        description: "Creates a new template",
        tags,
        body: Type.Object({
          contents: Type.Array(TemplateContentType, { minItems: 1 }),
          variables: Type.Optional(
            Type.Array(
              Type.Object({
                name: Type.String({ minLength: 1 }),
              }),
              {
                minItems: 1,
                description:
                  "List of the variables that are needed to be filled to create a message using this template",
              },
            ),
          ),
        }),
        response: {
          "5xx": HttpError,
          "4xx": HttpError,
          201: Type.Object({
            data: Type.Object({
              id: Type.String({
                format: "uuid",
                description: "Unique id of the created message",
              }),
            }),
          }),
        },
      },
    },
    async function handleCreate(request, reply) {
      const errorCode = "CREATE_TEMPLATE";
      const userId = ensureUserIdIsSet(request, errorCode);

      const { contents, variables } = request.body;

      let templateMetaId: string | undefined;
      // Can of course create a huge CTE here.
      const client = await app.pg.pool.connect();
      try {
        client.query("BEGIN");

        const queryFilter: string[] = [];
        const values: string[] = [
          ensureOrganizationIdIsSet(request, errorCode),
        ];
        let index = 1;
        for (const { templateName, language: lang } of contents) {
          queryFilter.push(
            `(lower(template_name) = lower($${++index}) AND lang=$${++index})`,
          );
          values.push(templateName, lang);
        }

        // Let's check so that the template name isn't taken for the organisation
        const templateNameExists = await client.query<{ exists: boolean }>(
          `
          select exists(select 1 from message_template_meta m 
            join message_template_contents c on c.template_meta_id = m.id
            where organisation_id = $1
            AND (${queryFilter.join(" OR ")})
            limit 1);
        `,
          values,
        );

        if (templateNameExists.rows[0]?.exists) {
          throw new ValidationError(errorCode, "template name already exists", [
            {
              fieldName: "templateName",
              message: "alreadyInUse",
              validationRule: "already-in-use",
            },
          ]);
        }

        const templateMetaResponse = await client.query<{ id: string }>(
          `
          insert into message_template_meta(organisation_id, created_by_user_id)
          values($1,$2)
          returning id
        `,
          [ensureOrganizationIdIsSet(request, errorCode), userId],
        );
        templateMetaId = templateMetaResponse.rows.at(0)?.id;

        if (!templateMetaId) {
          throw new ServerError(errorCode, "failed to create a template meta");
        }

        for (const content of contents) {
          const {
            excerpt,
            language: lang,
            templateName,
            plainText,
            richText,
            subject,
          } = content;
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

        for (const field of variables || []) {
          await client.query(
            `
            insert into message_template_variables(template_meta_id, field_name)
            values($1, $2)
          `,
            [templateMetaId, field.name],
          );
        }

        await client.query("COMMIT");
      } catch (err) {
        client.query("ROLLBACK");
        if (err instanceof Error) {
          this.log.error(err.message);
        }

        throw isLifeEventsError(err)
          ? err
          : new ServerError(errorCode, "failed to create template");
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
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Template.Write]),
      schema: {
        description: "Updates the requested template",
        tags,
        params: {
          templateId: Type.String({ format: "uuid" }),
        },
        body: Type.Object({
          id: Type.String({ format: "uuid" }),
          contents: Type.Array(TemplateContentType, { minItems: 1 }),
          variables: Type.Optional(
            Type.Array(
              Type.Object({
                name: Type.String({ minLength: 1 }),
              }),
              {
                minItems: 1,
                description:
                  "List of the variables that are needed to be filled to create a message using this template",
              },
            ),
          ),
        }),
        response: {
          200: Type.Null(),
          "4xx": HttpError,
          "5xx": HttpError,
        },
      },
    },
    async function handleUpdate(request, _reply) {
      const templateId = request.params.templateId;
      // adding this will return 404
      // if template does not exist
      await getTemplate(app, templateId);

      const errorCode = "TEMPLATE_UPDATE";

      const { contents, variables } = request.body;

      const client = await app.pg.pool.connect();
      try {
        client.query("BEGIN");

        const queryFilter: string[] = [];
        const values: string[] = [
          ensureOrganizationIdIsSet(request, errorCode),
          templateId,
        ];
        let index = values.length;
        for (const { templateName, language: lang } of contents) {
          queryFilter.push(
            `(lower(template_name) = lower($${++index}) AND lang=$${++index})`,
          );
          values.push(templateName, lang);
        }

        // Let's check so that the template name isn't taken
        const templateNameExists = await client.query<{ exists: boolean }>(
          `
          select exists(select 1 from message_template_meta m 
            join message_template_contents c on c.template_meta_id = m.id
            where organisation_id = $1
            AND m.id != $2
            AND (${queryFilter.join(" OR ")})
            limit 1);
        `,
          values,
        );

        if (templateNameExists.rows[0]?.exists) {
          throw new ValidationError(errorCode, "template name already exists", [
            {
              fieldName: "templateName",
              message: "alreadyInUse",
              validationRule: "already-in-use",
            },
          ]);
        }

        await client.query(
          `
          delete from message_template_contents
          where template_meta_id = $1
        `,
          [templateId],
        );
        for (const content of contents) {
          const {
            excerpt,
            language: lang,
            templateName,
            plainText,
            richText,
            subject,
          } = content;
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

        for (const variable of variables || []) {
          const values = [templateId, variable.name];
          await client.query(
            `
            insert into message_template_variables(template_meta_id, field_name)
            values($1, $2)
            on conflict(template_meta_id, field_name) do update set
            field_name = $2
            where message_template_variables.template_meta_id = $1 and message_template_variables.field_name = $2
          `,
            values,
          );
        }
        await client.query("COMMIT");
      } catch (error) {
        console.log(error);
        client.query("ROLLBACK");
        throw isLifeEventsError(error)
          ? error
          : new ServerError(errorCode, "failed to update", error);
      } finally {
        client.release();
      }
    },
  );

  app.delete<GetTemplate>(
    "/:templateId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Template.Delete]),
      schema: {
        description: "Deletes the requested template",
        tags,
        params: {
          templateId: Type.String({ format: "uuid" }),
        },
        response: {
          200: Type.Null(),
          "4xx": HttpError,
          "5xx": HttpError,
        },
      },
    },
    async function handleDelete(request, _reply) {
      const templateId = request.params.templateId;

      // adding this will return 404
      // if template does not exist
      await getTemplate(app, templateId);

      await app.pg.pool.query(
        `
          UPDATE message_template_meta
          SET deleted_at=now()
          WHERE id = $1;
        `,
        [templateId],
      );
    },
  );

  const getTemplate = async (app: FastifyInstance, templateId: string) => {
    const errorCode = "TEMPLATE_GET_ONE";
    const templateMeta = await app.pg.pool.query<{
      templateName: string;
      subject: string;
      excerpt: string;
      plainText: string;
      richText: string;
      language: string;
      fieldName?: string;
    }>(
      `
          select
            template_name as "templateName",
            subject,
            excerpt,
            plain_text as "plainText",
            rich_text as "richText",
            lang as "language",
            v.field_name as "fieldName"
          from message_template_meta m
          join message_template_contents c on c.template_meta_id = m.id
          left join message_template_variables v on v.template_meta_id = m.id
          where m.id = $1 AND m.deleted_at is null;
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
        language: string;
      }[];
      fields: { fieldName: string }[];
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
        language,
      } = row;

      const content = template.contents?.find(
        (content) => content.language === language,
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
          language,
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
        template.fields.push({ fieldName });
      }
    }

    if (!template.contents.length) {
      throw new NotFoundError(errorCode, "no template found");
    }

    return template;
  };
}
