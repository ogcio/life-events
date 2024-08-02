import { FastifyInstance } from "fastify";
import {
  EmailCreateSchema,
  EmailProviderSchema,
  GenericResponse,
  getGenericResponseSchema,
  PaginationParams,
  PaginationParamsSchema,
  ProviderListItemSchema,
  ProviderUpdateSchema,
  EditableProvidersSchema,
  ProviderListSchema,
  SmsProviderSchema,
  ProviderCreateSchema,
  SmsCreateSchema,
} from "../../types/schemaDefinitions";
import { Static, Type } from "@sinclair/typebox";
import { HttpError } from "../../types/httpErrors";
import { getPaginationLinks, sanitizePagination } from "../../utils/pagination";
import { QueryResult } from "pg";
import {
  BadRequestError,
  NotFoundError,
  ServerError,
  ValidationError,
} from "shared-errors";
import { Permissions } from "../../types/permissions";

export const prefix = "/providers";

const tags = ["Providers"];

function isSmsProvider(
  provider: unknown,
): provider is Static<typeof SmsCreateSchema> {
  return (provider as Static<typeof SmsCreateSchema>).type === "sms";
}

function isEmailProvider(
  provider: unknown,
): provider is Static<typeof EmailCreateSchema> {
  return (provider as Static<typeof EmailCreateSchema>).type === "email";
}

export default async function providers(app: FastifyInstance) {
  // get providers
  app.get<{
    Querystring: {
      search?: string;
      type: "email" | "sms";
      primary?: boolean;
    } & PaginationParams;
    Response: GenericResponse<Static<typeof ProviderListSchema>>;
  }>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Provider.Read]),
      schema: {
        tags,
        querystring: Type.Optional(
          Type.Composite([
            Type.Object({
              search: Type.Optional(Type.String()),
              primary: Type.Optional(Type.Boolean()),
              type: EditableProvidersSchema,
            }),
            PaginationParamsSchema,
          ]),
        ),
        response: {
          200: getGenericResponseSchema(ProviderListSchema),
          "5xx": HttpError,
          "4xx": HttpError,
        },
      },
    },
    async function handleGetProviders(request) {
      const errorProcess = "GET_PROVIDERS";
      const { limit, offset } = sanitizePagination({
        limit: request.query.limit,
        offset: request.query.offset,
      });
      const { organizationId } = request.userData!;
      const { type } = request.query;

      const textSearchILikeClause = request.query?.search
        ? `%${request.query.search}%`
        : "%%";

      type QueryProvider = Static<typeof ProviderListItemSchema> & {
        count: number;
      };
      let query: QueryResult<QueryProvider> | undefined;
      let primaryFilter = "true";
      if (request.query.primary === true) {
        primaryFilter = "where is_primary = true";
      } else if (request.query.primary === false) {
        primaryFilter = "where is_primary != true";
      }
      if (type == "email") {
        try {
          query = await app.pg.pool.query<QueryProvider>(
            `
            with count_selection as(
                select count(*) from email_providers
                where organisation_id = $1
            )
            select
                id,
                provider_name as "providerName",
                is_primary as "isPrimary",
                'email' as "type",
                (select count from count_selection) as "count"
            from email_providers
            where organisation_id = $1
            and provider_name ilike $2
            and ${primaryFilter}
            order by provider_name
            limit $3
            offset $4
        `,
            [organizationId, textSearchILikeClause, limit, offset],
          );
        } catch (error) {
          throw new ServerError(
            errorProcess,
            "failed to query email providers",
            error,
          );
        }
      } else if (type === "sms") {
        try {
          query = await app.pg.pool.query<QueryProvider>(
            `
              with count_selection as(
                  select count(*) from sms_providers
                  where organisation_id = $1
              )
              select
                  id,
                  provider_name as "providerName",
                  is_primary as "isPrimary",
                  'sms' as "type",
                  (select count from count_selection) as "count"
              from sms_providers
              where organisation_id = $1
              and provider_name ilike $2
              and ${primaryFilter}
              order by provider_name
              limit $3
              offset $4
          `,
            [organizationId, textSearchILikeClause, limit, offset],
          );
        } catch (error) {
          throw new ServerError(
            errorProcess,
            "failed to query sms providers",
            error,
          );
        }
      } else {
        throw new BadRequestError(
          errorProcess,
          "illegal type, email or sms accepted",
        );
      }

      const totalCount = query.rows.at(0)?.count || 0;
      const url = new URL(`/api/v1/${prefix}`, process.env.HOST_URL).href;
      const links = getPaginationLinks({
        totalCount,
        url,
        limit,
        offset,
      });

      const response: GenericResponse<Static<typeof ProviderListSchema>> = {
        data: query.rows,
        metadata: {
          totalCount,
          links,
        },
      };

      return response;
    },
  );

  //get provider
  app.get<{
    Querystring: { type: "email" | "sms" };
    Params: {
      providerId: string;
    };
  }>(
    "/:providerId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Provider.Read]),
      schema: {
        tags,
        params: {
          providerId: Type.String({
            format: "uuid",
          }),
        },
        querystring: Type.Optional(
          Type.Composite([
            Type.Object({
              type: EditableProvidersSchema,
            }),
          ]),
        ),
        response: {
          200: Type.Object({
            data: ProviderUpdateSchema,
          }),
          "5xx": HttpError,
          "4xx": HttpError,
        },
      },
    },
    async function handleGetProvider(request) {
      const organisationId = request.userData?.organizationId!;
      const errorProcess = "GET_PROVIDER";
      const providerId = request.params.providerId;

      if (request.query.type !== "email" && request.query.type !== "sms") {
        throw new BadRequestError(errorProcess, "illegal request type");
      }
      let provider:
        | Static<typeof EmailProviderSchema>
        | Static<typeof SmsProviderSchema>
        | undefined;

      if (request.query.type === "email") {
        try {
          const queryResult = await app.pg.pool.query<
            Static<typeof EmailProviderSchema>
          >(
            `
                select 
                    id,
                    'email' as "type",
                    provider_name as "providerName",
                    COALESCE(is_primary, false) as "isPrimary",
                    smtp_host as "smtpHost",
                    smtp_port as "smtpPort",
                    username,
                    pw as "password",
                    COALESCE(throttle_ms, 0) as "throttle",
                    from_address as "fromAddress",
                    is_ssl as "ssl"
                from email_providers
                where organisation_id = $1 and id = $2
                order by provider_name
          `,
            [organisationId, providerId],
          );

          provider = queryResult.rows.at(0);
        } catch (error) {
          throw new ServerError(
            errorProcess,
            "failed to query email provider",
            error,
          );
        }

        if (!provider) {
          throw new NotFoundError(
            errorProcess,
            "failed to find email provider",
          );
        }
      } else if (request.query.type === "sms") {
        try {
          const queryResult = await app.pg.pool.query<
            Static<typeof SmsProviderSchema>
          >(
            `
                select 
                    id,
                    'sms' as "type",
                    provider_name as "providerName",
                    COALESCE(is_primary, false) as "isPrimary",
                    config
                from sms_providers
                where organisation_id = $1 and id = $2
                order by provider_name
          `,
            [organisationId, providerId],
          );

          provider = queryResult.rows.at(0);
        } catch (error) {
          throw new ServerError(
            errorProcess,
            "failed to query sms provider",
            error,
          );
        }

        if (!provider) {
          throw new NotFoundError(errorProcess, "failed to find sms provider");
        }
      }

      return { data: provider };
    },
  );

  // create provider
  app.post<{
    Body: Static<typeof EmailCreateSchema> | Static<typeof SmsCreateSchema>;
  }>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Provider.Write]),
      schema: {
        tags,
        body: ProviderCreateSchema,
        response: {
          200: Type.Object({
            data: Type.Object({
              id: Type.String({ format: "uuid" }),
            }),
          }),
          "5xx": HttpError,
          "4xx": HttpError,
        },
      },
    },
    async function handleCreateProvider(request) {
      const organisationid = request.userData?.organizationId!;
      const errorProcess = "CREATE_PROVIDER";
      const provider = request.body;

      if (!isSmsProvider(provider) && !isEmailProvider(provider)) {
        throw new BadRequestError(errorProcess, "illegal type query");
      }

      let providerId = "";
      if (isSmsProvider(provider)) {
        const client = await app.pg.pool.connect();
        try {
          client.query("begin");
          const isPrimaryConverted = provider.isPrimary || null;
          if (isPrimaryConverted) {
            await client.query(
              `
            update sms_providers
            set is_primary = null
            where organisation_id = $1
          `,
              [organisationid],
            );
          }

          const queryResult = await client.query<{ providerId: string }>(
            `
            insert into sms_providers(
                provider_name,
                organisation_id,
                config,
                is_primary
            ) values(
                $1, $2, $3, $4
            )
            returning id as "providerId"
            `,
            [
              provider.providerName,
              organisationid,
              provider.config,
              isPrimaryConverted,
            ],
          );

          providerId = queryResult.rows.at(0)?.providerId || "";
          if (!providerId) {
            throw new Error("provider id from query result was undefined");
          }

          await client.query("commit");
        } catch (error) {
          await client.query("rollback");
          throw new ServerError(
            errorProcess,
            "failed to insert sms provider",
            error,
          );
        }
      } else if (isEmailProvider(provider)) {
        const client = await app.pg.pool.connect();

        try {
          client.query("begin");
          const isPrimaryConverted = provider.isPrimary || null;
          if (isPrimaryConverted) {
            await client.query(
              `
            update email_providers
            set is_primary = null
            where organisation_id = $1
          `,
              [organisationid],
            );
          }

          const queryResult = await client.query<{ providerId: string }>(
            `
            INSERT INTO email_providers(provider_name, smtp_host, smtp_port, username, pw, from_address, throttle_ms, is_ssl, organisation_id, is_primary)
            VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            RETURNING id as "providerId"
            `,
            [
              provider.providerName,
              provider.smtpHost,
              provider.smtpPort,
              provider.username,
              provider.password,
              provider.fromAddress,
              provider.throttle,
              provider.ssl,
              organisationid,
              isPrimaryConverted,
            ],
          );

          providerId = queryResult.rows.at(0)?.providerId || "";
          if (!providerId) {
            throw new Error("provider id from query result was undefined");
          }

          await client.query("commit");
        } catch (error) {
          await client.query("rollback");
          throw new ServerError(
            errorProcess,
            "failed to insert email provider",
            error,
          );
        }
      }

      return { data: { id:providerId } };
    },
  );

  // update provider
  app.put<{
    Body: Static<typeof ProviderUpdateSchema>;
    Params: { providerId: string };
  }>(
    "/:providerId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Provider.Write]),
      schema: {
        tags,
        params: {
          providerId: Type.String({ format: "uuid" }),
        },
        body: ProviderUpdateSchema,
        response: {
          200: Type.Null(),
          "5xx": HttpError,
          "4xx": HttpError,
        },
      },
    },
    async function handleUpdateProvider(request) {
      const errorProcess = "UPDATE_PROVIDER";
      if (request.body.id !== request.params.providerId) {
        throw new BadRequestError(
          errorProcess,
          "provider id from body and url param are not identical",
        );
      }

      const organizationId = request.userData?.organizationId!;
      const provider = request.body;

      if (!isSmsProvider(provider) && !isEmailProvider(provider)) {
        throw new BadRequestError(errorProcess, "illegal type query");
      }

      if (isSmsProvider(provider)) {
        const client = await app.pg.pool.connect();
        try {
          client.query("begin");
          const isPrimaryConverted = provider.isPrimary || null;
          if (isPrimaryConverted) {
            await client.query(
              `
            update sms_providers
            set is_primary = null
            where organisation_id = $1
          `,
              [organizationId],
            );
          }

          await client.query<{ providerId: string }>(
            `
            update sms_providers set 
            provider_name = $1,
            config = $2,
            is_primary = $3
            where id = $4 and organisation_id = $5
            `,
            [
              provider.providerName,
              provider.config,
              isPrimaryConverted,
              provider.id,
              organizationId,
            ],
          );

          await client.query("commit");
        } catch (error) {
          await client.query("rollback");
          throw new ServerError(
            errorProcess,
            "failed to update sms provider",
            error,
          );
        }
      } else if (isEmailProvider(provider)) {
        const client = await app.pg.pool.connect();

        let addressExists = false;
        try {
          const duplicationQueryResult = await client.query<{
            exists: boolean;
          }>(
            `
            select exists(
              select * from email_providers
              where organisation_id = $1 
              and lower(from_address) = lower($2)
              and id != $3
            )
          `,
            [organizationId, provider.fromAddress, provider.id],
          );

          addressExists = Boolean(duplicationQueryResult.rows.at(0)?.exists);
        } catch (error) {
          throw new ServerError(
            errorProcess,
            "failed to query if provider address existed",
            error,
          );
        }

        if (addressExists) {
          throw new ValidationError(
            errorProcess,
            "from address already in use",
            [
              {
                fieldName: "fromAddress",
                message: "alreadyInUse",
                validationRule: "already-in-use",
              },
            ],
          );
        }

        try {
          client.query("begin");
          const isPrimaryConverted = provider.isPrimary || null;
          if (isPrimaryConverted) {
            await client.query(
              `
              update email_providers set is_primary = null
              where organisation_id = $1
              `,
              [organizationId],
            );
          }

          await client.query(
            `
                UPDATE email_providers set 
                  provider_name = $1, 
                  smtp_host = $2,
                  smtp_port = $3,
                  username = $4,
                  pw = $5,
                  from_address = $6,
                  throttle_ms = $7,
                  is_ssl = $8,
                  is_primary = $9
                WHERE id = $10 and organisation_id = $11
              `,
            [
              provider.providerName,
              provider.smtpHost,
              provider.smtpPort,
              provider.username,
              provider.password,
              provider.fromAddress,
              provider.throttle,
              provider.ssl,
              isPrimaryConverted,
              provider.id,
              organizationId,
            ],
          );

          client.query("commit");
        } catch (error) {
          client.query("rollback");
          throw new ServerError(
            errorProcess,
            "failed to update email provider",
            error,
          );
        }
      }
    },
  );

  // delete provider
  app.delete<{ Params: { providerId: string } }>(
    "/:providerId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Provider.Delete]),
      schema: {
        tags,
        params: {
          providerId: Type.String({ format: "uuid" }),
        },
        response: {
          200: Type.Null(),
          "5xx": HttpError,
          "4xx": HttpError,
        },
      },
    },
    async function handleDeleteProvider(request) {
      const errorProcess = "DELETE_PROVIDER";
      const organizationId = request.userData?.organizationId!;
      const providerId = request.params.providerId;

      let deleted = 0;
      try {
        const deleteQueryResult = await app.pg.pool.query(
          `
        with sms as (
            delete from sms_providers 
            where id = $1 and organisation_id = $2
            returning 1
        ), email as(
            delete from email_providers 
            where id = $1 and organisation_id = $2
            returning 1
        )
        select * from sms union all select * from email
      `,
          [providerId, organizationId],
        );

        deleted = deleteQueryResult.rowCount || 0;
      } catch (error) {
        throw new ServerError(errorProcess, "failed delete query", error);
      }

      if (deleted === 0) {
        throw new NotFoundError(errorProcess, "no resource found");
      }
    },
  );
}
