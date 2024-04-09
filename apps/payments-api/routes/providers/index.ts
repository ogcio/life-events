import { FastifyInstance } from "fastify";
import { Type } from "@sinclair/typebox";
import { httpErrors } from "@fastify/sensible";
import { HttpError } from "../../types/httpErrors";
import {
  CreateProvider,
  ParamsWithProviderId,
  ProvidersList,
  Provider,
  UpdateProvider,
} from "../../types/schemaDefinitions";
import { permissions } from "../../plugins/logtoAuth";

export default async function providers(app: FastifyInstance) {
  app.post<{ Body: CreateProvider; Reply: { id: string } }>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermission(req, res, [permissions.READ_PAYMENT]),
      schema: {
        tags: ["Providers"],
        body: CreateProvider,
        response: {
          200: Type.Object({
            id: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;
      const { name, type, data } = request.body;

      const result = await app.pg.query(
        `
        INSERT INTO payment_providers (user_id, provider_name, provider_type, status, provider_data)
        VALUES ($1, $2, $3, $4, $5) RETURNING provider_id as id
            `,
        [userId, name, type, "connected", data],
      );

      reply.send({ id: result.rows[0].id });
    },
  );

  app.get<{ Reply: ProvidersList }>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermission(req, res, [permissions.READ_PAYMENT]),
      schema: {
        tags: ["Providers"],
        response: {
          200: Type.Array(
            Type.Union([
              Type.Object({
                id: Type.String(),
                name: Type.String(),
                type: Type.String(),
                data: Type.Any(),
                status: Type.String(),
              }),
            ]),
          ),
        },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;
      const result = await app.pg.query(
        `
          SELECT
            provider_id as id,
            provider_name as name,
            provider_type as type,
            provider_data as data,
            status
          FROM payment_providers
          WHERE user_id = $1
        `,
        [userId],
      );

      reply.send(result.rows);
    },
  );

  app.get<{ Reply: Provider | Error; Params: ParamsWithProviderId }>(
    "/:providerId",
    {
      preValidation: (req, res) =>
        app.checkPermission(req, res, [permissions.READ_PAYMENT]),
      schema: {
        tags: ["Providers"],
        response: {
          200: Type.Object({
            id: Type.String(),
            name: Type.String(),
            type: Type.String(),
            data: Type.Any(),
            status: Type.String(),
          }),
          404: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;
      const { providerId } = request.params;

      const result = await app.pg.query(
        `
        SELECT
          provider_id as id,
          provider_name as name,
          provider_type as type,
          provider_data as data,
          status
        FROM payment_providers
        WHERE provider_id = $1
        AND user_id = $2
        `,
        [providerId, userId],
      );

      if (!result.rows.length) {
        reply.send(httpErrors.notFound("The requested provider was not found"));
        return;
      }

      reply.send(result.rows[0]);
    },
  );

  app.put<{ Body: UpdateProvider; Params: ParamsWithProviderId }>(
    "/:providerId",
    {
      preValidation: (req, res) =>
        app.checkPermission(req, res, [permissions.READ_PAYMENT]),
      schema: {
        tags: ["Providers"],
        body: UpdateProvider,
        response: {
          200: Type.Object({
            ok: Type.Boolean(),
          }),
        },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;
      const { providerId } = request.params;
      const { name, data, status } = request.body;

      await app.pg.query(
        `
          UPDATE payment_providers
          SET provider_name = $1,
            provider_data = $2,
            status = $3
          WHERE provider_id = $4
          AND user_id = $5
        `,
        [name, data, status, providerId, userId],
      );

      reply.send();
    },
  );
}
