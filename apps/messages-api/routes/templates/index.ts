import { Type } from "@sinclair/typebox";
import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
const tags = ["Templates"];

interface CreateTemplate {
  Body: {
    contents: {
      name: string;
      lang: string;
      subject: string;
      excerpt: string;
      richText: string;
      plainText: string;
    }[];
    variables: { name: string; type: string }[];
  };
}

interface UpdateTemplate {
  Body: {
    contents: {
      id: string;
      name: string;
      lang: string;
      subject: string;
      excerpt: string;
      richText: string;
      plainText: string;
    }[];
    variables: { name: string; type: string }[];
  };
  Params: {
    templateId: string;
  };
}

interface GetTemplates {
  Querystring: {
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

const TemplateListType = Type.Object({
  templateMetaId: Type.String({ format: "uuid" }),
  lang: Type.String(),
  templateName: Type.String(),
});

// templateName?: string;
// subject?: string;
// excerpt?: string;
// plainText?: string;
// richText?: string;
// fields?: { fieldName: string; fieldType: string }[];
const TemplateType = Type.Object({
  templateName: Type.String(),
  subject: Type.String(),
  excerpt: Type.String(),
  plainText: Type.String(),
  richText: Type.String(),
  fields: Type.Array(
    Type.Object({ fieldName: Type.String(), fieldType: Type.String() }),
  ),
});

export default async function templates(app: FastifyInstance) {
  app.get<GetTemplates>(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        querystring: Type.Optional(
          Type.Object({
            lang: Type.String(),
          }),
        ),
        tags,
        response: {
          200: Type.Object({
            data: Type.Array(TemplateListType),
          }),
        },
      },
    },
    async function handleGetAll(request, reply) {
      const lang = request.query.lang ?? "en";
      const data = await app.pg.pool
        .query<{
          templateMetaId: string;
          lang: string;
          templateName: string;
        }>(
          `
        select  
          m.id as "templateMetaId",
          lang,
          template_name as "templateName"
        from message_template_meta m
        join message_template_contents c on c.template_meta_id = m.id
        where lang=$1
      `,
          [lang],
        )
        .then((res) => res.rows);

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
            data: TemplateType,
          }),
        },
      },
    },
    async function handleGetOne(request, reply) {
      const lang = request.query.lang ?? "en";
      const templateId = request.params.templateId;

      const templateMeta = await app.pg.pool
        .query<{
          templateName: string;
          subject: string;
          excerpt: string;
          plainText: string;
          richText: string;
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
            v.field_name as "fieldName",
            v.field_type as "fieldType"
            from message_template_meta m
            join message_template_contents c on c.template_meta_id = m.id
            left join message_template_variables v on v.template_meta_id = m.id
            where m.id = $1 and c.lang = $2
      `,
          [templateId, lang],
        )
        .then((res) => res.rows);

      const template: {
        templateName?: string;
        subject?: string;
        excerpt?: string;
        plainText?: string;
        richText?: string;
        fields?: { fieldName: string; fieldType: string }[];
      } = {};

      for (const row of templateMeta) {
        const {
          excerpt,
          plainText,
          richText,
          subject,
          templateName,
          fieldName,
          fieldType,
        } = row;
        template.excerpt = excerpt;
        template.plainText = plainText;
        template.richText = richText;
        template.subject = subject;
        template.templateName = templateName;

        if (fieldName && fieldType) {
          if (!template.fields) {
            template.fields = [];
          }
          template.fields.push({ fieldName, fieldType });
        }
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
      },
    },
    async function handleCreate(request, reply) {
      const userId = request.user!.id;

      const organisationId = randomUUID().toString();
      const { contents, variables } = request.body;

      // Can of course create a huge CTE here.
      const client = await app.pg.pool.connect();
      try {
        client.query("BEGIN");
        const templateMetaId = await client
          .query<{ id: string }>(
            `
          insert into message_template_meta(organisation_id, created_by_user_id)
          values($1,$2)
          returning id
        `,
            [organisationId, userId],
          )
          .then((res) => res.rows.at(0)?.id);

        if (!templateMetaId) {
          throw new Error("failed to create a template meta");
        }

        for (const content of contents) {
          const { excerpt, lang, name, plainText, richText, subject } = content;
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
            [templateMetaId, name, lang, subject, excerpt, richText, plainText],
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
        client.query("COMMIT");
      } catch (err) {
        client.query("ROLLBACK");
        if (err instanceof Error) {
          this.log.error(err.message);
        }
      } finally {
        client.release();
      }
    },
  );
  app.put<UpdateTemplate>(
    "/:templateId",
    {
      preValidation: app.verifyUser,
      schema: {
        tags,
      },
    },
    async function handleUpdate(request, reply) {
      const templateId = request.params.templateId;
      const { contents, variables } = request.body;

      const client = await app.pg.pool.connect();
      try {
        client.query("BEGIN");
        for (const content of contents) {
          const { excerpt, lang, name, plainText, richText, subject } = content;
          const values = [
            templateId,
            name,
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
                ) on conflict(template_meta_id, lang) do update 
                set 
                    template_name = $2,
                    subject = $4,
                    excerpt = $5,
                    rich_text = $6, 
                    plain_text = $7,
                    updated_at = now()
                where message_template_contents.template_meta_id = $1 and message_template_contents.lang = $3
            `,
            values,
          );
        }

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
        client.query("COMMIT");
      } catch (err) {
        client.query("ROLLBACK");
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
      },
    },
    async function handleDelete(request, reply) {
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
