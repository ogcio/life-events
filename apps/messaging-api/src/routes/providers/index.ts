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
} from "../../types/schemaDefinitions.js";
import { Static, Type } from "@sinclair/typebox";
import { HttpError } from "../../types/httpErrors.js";
import {
  getPaginationLinks,
  sanitizePagination,
} from "../../utils/pagination.js";
import { QueryResult } from "pg";
import {
  BadRequestError,
  isLifeEventsError,
  LifeEventsError,
  NotFoundError,
  ServerError,
  ValidationError,
} from "shared-errors";
import { Permissions } from "../../types/permissions.js";
import { ensureOrganizationIdIsSet } from "../../utils/authentication-factory.js";

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
      primary?: boolean;
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
                  Type.Boolean({
                    description:
                      "If set, returns only the primary providers if true, otherwise the non-primary ones",
                  }),
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
      const errorProcess = "GET_PROVIDERS";
      const { limit, offset } = sanitizePagination({
        limit: request.query.limit,
        offset: request.query.offset,
      });
      const organizationId = ensureOrganizationIdIsSet(request, errorProcess);
      const { type } = request.query;

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

      const url = new URL(`/api/v1${prefix}`, process.env.HOST_URL);
      if (type == "email") {
        try {
          url.searchParams.append("type", "email");
          query = await app.pg.pool.query<QueryProvider>(
            `
            with count_selection as(
                select count(*) from email_providers
                where organisation_id = $1
                and deleted_at is null
                and ${primaryFilter}
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
            and ${primaryFilter}
            order by provider_name
            limit $2
            offset $3
        `,
            [organizationId, limit, offset],
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
          url.searchParams.append("type", "sms");
          query = await app.pg.pool.query<QueryProvider>(
            `
              with count_selection as(
                  select count(*) from sms_providers
                  where organisation_id = $1
                  and deleted_at is null
                  and ${primaryFilter}
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
              and ${primaryFilter}
              order by provider_name
              limit $2
              offset $3
          `,
            [organizationId, limit, offset],
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

      const links = getPaginationLinks({
        totalCount,
        url,
        limit: Number(limit),
        offset: Number(offset),
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
      const errorProcess = "GET_PROVIDER";
      const organisationId = ensureOrganizationIdIsSet(request, errorProcess);
      const providerId = request.params.providerId;

      if (request.query.type !== "email" && request.query.type !== "sms") {
        throw new BadRequestError(errorProcess, "illegal request type");
      }

      return {
        data: await getProvider({
          app,
          providerType: request.query.type,
          organisationId,
          providerId,
          errorProcess,
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
      const errorProcess = "CREATE_PROVIDER";

      const organisationid = ensureOrganizationIdIsSet(request, errorProcess);
      const provider = request.body;

      if (!isSmsProvider(provider) && !isEmailProvider(provider)) {
        throw new BadRequestError(errorProcess, "illegal type query");
      }

      const client = await app.pg.pool.connect();

      let providerId = "";

      let queryError: LifeEventsError | undefined;
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
            throw new ValidationError(
              errorProcess,
              "provider name already in use",
              [
                {
                  fieldName: "providerName",
                  message: "alreadyInUse",
                  validationRule: "already-in-use",
                },
              ],
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
          queryError = isLifeEventsError(error)
            ? error
            : new ServerError(
                errorProcess,
                "failed to insert sms provider",
                error,
              );
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
            throw new ValidationError(
              errorProcess,
              "provider name already in use",
              [
                {
                  fieldName: "providerName",
                  message: "alreadyInUse",
                  validationRule: "already-in-use",
                },
              ],
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
          queryError = isLifeEventsError(error)
            ? error
            : new ServerError(
                errorProcess,
                "failed to insert email provider",
                error,
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
      const errorProcess = "UPDATE_PROVIDER";
      if (request.body.id !== request.params.providerId) {
        throw new BadRequestError(
          errorProcess,
          "provider id from body and url param are not identical",
        );
      }

      const organizationId = ensureOrganizationIdIsSet(request, errorProcess);
      const provider = request.body;

      if (!isSmsProvider(provider) && !isEmailProvider(provider)) {
        throw new BadRequestError(errorProcess, "illegal type query");
      }

      // adding this will return
      // 404 is it does not exist
      await getProvider({
        app,
        providerType: provider.type,
        organisationId: organizationId,
        providerId: request.params.providerId,
        errorProcess,
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
      const errorProcess = "DELETE_PROVIDER";
      const organizationId = ensureOrganizationIdIsSet(request, errorProcess);
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
        throw new ServerError(errorProcess, "failed delete query", error);
      }

      if (deleted === 0) {
        throw new NotFoundError(errorProcess, "no provider found");
      }
    },
  );

  const getProvider = async (params: {
    app: FastifyInstance;
    providerType: string;
    providerId: string;
    errorProcess: string;
    organisationId: string;
  }) => {
    let provider:
      | Static<typeof EmailProviderSchema>
      | Static<typeof SmsProviderSchema>
      | undefined;

    const { app, providerType, providerId, errorProcess, organisationId } =
      params;
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
        throw new ServerError(
          errorProcess,
          "failed to query email provider",
          error,
        );
      }

      if (!provider) {
        throw new NotFoundError(errorProcess, "failed to find email provider");
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

    return provider;
  };
}
