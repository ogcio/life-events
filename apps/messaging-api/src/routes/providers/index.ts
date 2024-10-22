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
  EditableProviderTypesSchema,
  ProviderListSchema,
  SmsProviderSchema,
  ProviderCreateSchema,
  SmsCreateSchema,
  EditableProviderTypes,
  TypeboxBooleanEnum,
  AcceptedQueryBooleanValues,
  parseBooleanEnum,
} from "../../types/schemaDefinitions.js";
import { Static, Type } from "@sinclair/typebox";
import { HttpError } from "../../types/httpErrors.js";
import { HttpError as SensibleHttpError } from "@fastify/sensible";
import {
  formatAPIResponse,
  sanitizePagination,
} from "../../utils/pagination.js";
import { QueryResult } from "pg";
import { Permissions } from "../../types/permissions.js";
import { ensureOrganizationIdIsSet } from "../../utils/authentication-factory.js";
import { isHttpError } from "http-errors";

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
      type: EditableProviderTypes;
      primary?: AcceptedQueryBooleanValues;
    } & PaginationParams;
    Response: GenericResponse<Static<typeof ProviderListSchema>>;
  }>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Provider.Read]),
      schema: {
        description: "Returns the providers matching the requested query",
        tags,
        querystring: Type.Optional(
          Type.Composite(
            [
              Type.Object({
                primary: Type.Optional(
                  TypeboxBooleanEnum(
                    undefined,
                    "If set, returns only the primary providers if true, otherwise the non-primary ones",
                  ),
                ),
                type: EditableProviderTypesSchema,
              }),
              PaginationParamsSchema,
            ],
            { description: "The 'type' parameter is mandatory" },
          ),
        ),
        response: {
          200: getGenericResponseSchema(ProviderListSchema),
          "5xx": HttpError,
          "4xx": HttpError,
        },
      },
    },
    async function handleGetProviders(request) {
      const { limit, offset } = sanitizePagination({
        limit: request.query.limit,
        offset: request.query.offset,
      });
      const organizationId = ensureOrganizationIdIsSet(request);
      const { type } = request.query;

      type QueryProvider = Static<typeof ProviderListItemSchema> & {
        count: number;
      };
      let query: QueryResult<QueryProvider> | undefined;
      let primaryFilter = "";
      const primaryQuery = request.query.primary
        ? parseBooleanEnum(request.query.primary)
        : undefined;
      if (primaryQuery === true) {
        primaryFilter = "AND is_primary = true";
      } else if (primaryQuery === false) {
        primaryFilter = "AND is_primary != true";
      }
      if (type == "email") {
        try {
          query = await app.pg.pool.query<QueryProvider>(
            `
            with count_selection as(
                select count(*) from email_providers
                where organisation_id = $1
                and deleted_at is null
                ${primaryFilter}
            )
            select
                id,
                provider_name as "providerName",
                is_primary as "isPrimary",
                'email' as "type",
                (select count from count_selection) as "count"
            from email_providers
            where organisation_id = $1
            AND deleted_at is null
            ${primaryFilter}
            order by provider_name
            limit $2
            offset $3
        `,
            [organizationId, limit, offset],
          );
        } catch (error) {
          throw app.httpErrors.createError(
            500,
            "failed to query email providers",
            { parent: error },
          );
        }
      } else if (type === "sms") {
        try {
          query = await app.pg.pool.query<QueryProvider>(
            `
              with count_selection as(
                  select count(*) from sms_providers
                  where organisation_id = $1
                  and deleted_at is null
                  ${primaryFilter}
              )
              select
                  id,
                  provider_name as "providerName",
                  is_primary as "isPrimary",
                  'sms' as "type",
                  (select count from count_selection) as "count"
              from sms_providers
              where organisation_id = $1
              AND deleted_at is null
              ${primaryFilter}
              order by provider_name
              limit $2
              offset $3
          `,
            [organizationId, limit, offset],
          );
        } catch (error) {
          throw app.httpErrors.createError(
            500,
            "failed to query sms providers",
            { parent: error },
          );
        }
      } else {
        throw app.httpErrors.badRequest("illegal type, email or sms accepted");
      }

      const totalCount = query.rows.at(0)?.count || 0;

      return formatAPIResponse({ data: query.rows, request, totalCount });
    },
  );

  //get provider
  app.get<{
    Querystring: { type: EditableProviderTypes };
    Params: {
      providerId: string;
    };
  }>(
    "/:providerId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Provider.Read]),
      schema: {
        description: "Returns the requested provider",
        tags,
        params: {
          providerId: Type.String({
            format: "uuid",
            description: "The unique id of the requested provider",
          }),
        },
        querystring: Type.Optional(
          Type.Composite(
            [
              Type.Object({
                type: EditableProviderTypesSchema,
              }),
            ],
            { description: "The 'type' parameter is mandatory" },
          ),
        ),
        response: {
          200: getGenericResponseSchema(ProviderUpdateSchema),
          "5xx": HttpError,
          "4xx": HttpError,
        },
      },
    },
    async function handleGetProvider(request) {
      const organisationId = ensureOrganizationIdIsSet(request);
      const providerId = request.params.providerId;

      if (request.query.type !== "email" && request.query.type !== "sms") {
        throw app.httpErrors.badRequest("illegal request type");
      }

      return {
        data: await getProvider({
          app,
          providerType: request.query.type,
          organisationId,
          providerId,
        }),
      };
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
        description: "Creates a new provider",
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
      const organisationid = ensureOrganizationIdIsSet(request);
      const provider = request.body;

      if (!isSmsProvider(provider) && !isEmailProvider(provider)) {
        throw app.httpErrors.badRequest("illegal type query");
      }

      const client = await app.pg.pool.connect();

      let providerId = "";

      let queryError: SensibleHttpError | undefined;
      if (isSmsProvider(provider)) {
        try {
          client.query("begin");

          const exists = await client.query<{ exists: boolean }>(
            `
              select exists(select 1 from sms_providers where organisation_id = $1 and lower(provider_name) = $2)
            `,
            [organisationid, provider.providerName.toLocaleLowerCase().trim()],
          );

          if (exists.rows.at(0)?.exists) {
            throw app.httpErrors.createError(
              422,
              "provider name already in use",
              {
                validation: [
                  {
                    fieldName: "providerName",
                    message: "alreadyInUse",
                    validationRule: "already-in-use",
                  },
                ],
              },
            );
          }

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
          queryError = isHttpError(error)
            ? error
            : app.httpErrors.createError(500, "failed to insert sms provider", {
                parent: error,
              });
        }
      } else if (isEmailProvider(provider)) {
        try {
          client.query("begin");

          const exists = await client.query<{ exists: boolean }>(
            `
              select exists(select 1 from email_providers where organisation_id = $1 and lower(provider_name) = $2)
            `,
            [organisationid, provider.providerName.toLocaleLowerCase().trim()],
          );

          if (exists.rows.at(0)?.exists) {
            throw app.httpErrors.createError(
              422,

              "provider name already in use",
              {
                validation: [
                  {
                    fieldName: "providerName",
                    message: "alreadyInUse",
                    validationRule: "already-in-use",
                  },
                ],
              },
            );
          }

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
          queryError = isHttpError(error)
            ? error
            : app.httpErrors.createError(
                500,
                "failed to insert email provider",
                { parent: error },
              );
        }
      }

      try {
        if (queryError) {
          await client.query("rollback");
          throw queryError;
        }
      } finally {
        client.release();
      }

      return { data: { id: providerId } };
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
        description: "Updates the requested provider",
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
      if (request.body.id !== request.params.providerId) {
        throw app.httpErrors.badRequest(
          "provider id from body and url param are not identical",
        );
      }

      const organizationId = ensureOrganizationIdIsSet(request);
      const provider = request.body;

      if (!isSmsProvider(provider) && !isEmailProvider(provider)) {
        throw app.httpErrors.badRequest("illegal type query");
      }

      // adding this will return
      // 404 is it does not exist
      await getProvider({
        app,
        providerType: provider.type,
        organisationId: organizationId,
        providerId: request.params.providerId,
      });

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
          throw app.httpErrors.createError(
            500,
            "failed to update sms provider",
            { parent: error },
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
          throw app.httpErrors.createError(
            500,
            "failed to query if provider address existed",
            { parent: error },
          );
        }

        if (addressExists) {
          throw app.httpErrors.createError(422, "from address already in use", {
            validation: [
              {
                fieldName: "fromAddress",
                message: "alreadyInUse",
                validationRule: "already-in-use",
              },
            ],
          });
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
          throw app.httpErrors.createError(
            500,
            "failed to update email provider",
            { parent: error },
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
        description: "Deletes the requested provider",
        tags,
        params: {
          providerId: Type.String({
            format: "uuid",
            description: "Unique id of the provider to be deleted",
          }),
        },
        response: {
          200: Type.Null(),
          "5xx": HttpError,
          "4xx": HttpError,
        },
      },
    },
    async function handleDeleteProvider(request) {
      const organizationId = ensureOrganizationIdIsSet(request);
      const providerId = request.params.providerId;

      let deleted = 0;
      try {
        const deleteQueryResult = await app.pg.pool.query(
          `
        WITH sms as (
            UPDATE sms_providers 
            SET deleted_at = now()
            WHERE id = $1 AND organisation_id = $2
            RETURNING 1
        ), email as(
            UPDATE email_providers 
            SET deleted_at = now()
            WHERE id = $1 AND organisation_id = $2
            RETURNING 1
        )
        SELECT * FROM sms UNION ALL select * FROM email
      `,
          [providerId, organizationId],
        );

        deleted = deleteQueryResult.rowCount || 0;
      } catch (error) {
        throw app.httpErrors.createError(500, "failed delete query", {
          parent: error,
        });
      }

      if (deleted === 0) {
        throw app.httpErrors.badRequest("no provider found");
      }
    },
  );

  const getProvider = async (params: {
    app: FastifyInstance;
    providerType: string;
    providerId: string;
    organisationId: string;
  }) => {
    let provider:
      | Static<typeof EmailProviderSchema>
      | Static<typeof SmsProviderSchema>
      | undefined;

    const { app, providerType, providerId, organisationId } = params;
    if (providerType === "email") {
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
                and deleted_at is null
              order by provider_name
        `,
          [organisationId, providerId],
        );

        provider = queryResult.rows.at(0);
      } catch (error) {
        throw app.httpErrors.createError(
          500,
          "failed to query email provider",
          { parent: error },
        );
      }

      if (!provider) {
        throw app.httpErrors.notFound("failed to find email provider");
      }
    } else if (providerType === "sms") {
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
                and deleted_at is null
              order by provider_name
        `,
          [organisationId, providerId],
        );

        provider = queryResult.rows.at(0);
      } catch (error) {
        throw app.httpErrors.createError(500, "failed to query sms provider", {
          parent: error,
        });
      }

      if (!provider) {
        throw app.httpErrors.notFound("failed to find sms provider");
      }
    }

    return provider;
  };
}
