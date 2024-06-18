import { Type } from "@sinclair/typebox";
import { createError } from "@fastify/error";
import { FastifyInstance } from "fastify";
import { organisationId } from "../../utils";
const tags = ["Providers - SMS"];

const SMS_PROVIDER_ERROR = "SMS_PROVIDER_ERROR";

type ConfigBase = {
  type: string;
};

type AwsSnsProvider = {
  accessKey: string;
  secretAccessKey: string;
  region: string;
};

type SmsProvider = {
  id: string;
  name: string;
  config: ConfigBase & AwsSnsProvider; // Union any other provider types.
};

const awsConfigType = Type.Object({
  type: Type.String(),
  accessKey: Type.String(),
  secretAccessKey: Type.String(),
  region: Type.String(),
});

const configType = Type.Union([awsConfigType]);

export default async function sms(app: FastifyInstance) {
  app.get(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        tags,
        response: {
          200: Type.Object({
            data: Type.Array(
              Type.Object({
                id: Type.String({ format: "uuid" }),
                name: Type.String(),
                type: Type.String(),
              }),
            ),
          }),
          "4xx": { $ref: "HttpError" },
          "5xx": { $ref: "HttpError" },
        },
      },
    },
    async function getProviders(_request, _reply) {
      try {
        const providers = await app.pg.pool.query<{
          id: string;
          name: string;
          type: string;
        }>(
          `
        select id, provider_name as "name", (config ->> 'type') as "type" from
        sms_providers
        -- where organisation_id = $1
        order by provider_name
        `,
          // [organisationId],
        );

        return { data: providers.rows };
      } catch (err) {
        throw createError(SMS_PROVIDER_ERROR, "failed to get providers", 500)();
      }
    },
  );

  app.get<{ Params: { providerId: string } }>(
    "/:providerId",
    {
      schema: {
        tags,
        params: {
          providerId: Type.String({ format: "uuid" }),
        },
        response: {
          200: {
            data: Type.Object({
              id: Type.String({ format: "uuid" }),
              name: Type.String(),
              config: Type.Union([configType]),
            }),
          },
          "4xx": { $ref: "HttpError" },
          "5xx": { $ref: "HttpError" },
        },
      },
    },
    async function getProvder(request, _reply) {
      const providerId = request.params.providerId;
      try {
        const provider = await app.pg.pool.query<SmsProvider>(
          `
        select 
            id,
            provider_name as "name", 
            config
        from sms_providers
        where id = $1 
        -- and organisation_id = $2
      `,
          // [providerId, organisationId],
          [providerId],
        );

        if (provider.rowCount === 0) {
          throw createError(SMS_PROVIDER_ERROR, "provider not found", 404)();
        }

        return { data: provider.rows[0] };
      } catch (err) {
        throw createError(SMS_PROVIDER_ERROR, "failed to get provider", 500)();
      }
    },
  );

  app.post<{
    Body: Omit<SmsProvider, "id">;
  }>(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        tags,
        body: Type.Object({
          name: Type.String(),
          config: configType,
        }),
        response: {
          "4xx": { $ref: "HttpError" },
          "5xx": { $ref: "HttpError" },
        },
      },
    },
    async function createHandler(request, _reply) {
      const body = request.body;
      try {
        await app.pg.pool.query(
          `
        insert into sms_providers(
            provider_name,
            organisation_id,
            config
        ) values(
            $1, $2, $3
        )
    `,
          [body.name, organisationId, JSON.stringify(body.config)],
        );
      } catch (err) {
        throw createError(
          SMS_PROVIDER_ERROR,
          "failed to create provider",
          500,
        )();
      }
    },
  );

  app.put<{ Body: SmsProvider; Params: { providerId: string } }>(
    "/:providerId",
    {
      preValidation: app.verifyUser,
      schema: {
        params: {
          providerId: Type.String({ format: "uuid" }),
        },
        tags,
        body: Type.Object({
          id: Type.String({ format: "uuid" }),
          name: Type.String(),
          config: configType,
        }),
        response: {
          "4xx": { $ref: "HttpError" },
          "5xx": { $ref: "HttpError" },
        },
      },
    },
    async function updateHandler(request, _reply) {
      if (request.body.id !== request.params.providerId) {
        throw createError(
          SMS_PROVIDER_ERROR,
          "body and url param ids are not the same",
          400,
        )();
      }
      try {
        await app.pg.pool.query(
          `
        update sms_providers set 
        provider_name = $1,
        config = $2
        where id = $3
        `,
          [
            request.body.name,
            JSON.stringify(request.body.config),
            request.body.id,
          ],
        );
      } catch (err) {
        throw createError(
          SMS_PROVIDER_ERROR,
          "failed to update provider",
          500,
        )();
      }
    },
  );

  app.delete<{ Params: { providerId: string } }>(
    "/:providerId",
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
    async function deleteHandler(request, _reply) {
      const providerId = request.params.providerId;
      try {
        await app.pg.pool.query(
          `
            delete from sms_providers
            where id = $1
        `,
          [providerId],
        );
      } catch (err) {
        throw createError(
          SMS_PROVIDER_ERROR,
          "failed to delete provider",
          500,
        )();
      }
    },
  );
}
