import { FastifyInstance } from "fastify";
import { Type } from "@sinclair/typebox";
import { HttpError } from "../../types/httpErrors";
import {
  CreateProvider,
  ParamsWithProviderId,
  ProvidersList,
  Provider,
  UpdateProvider,
} from "../../types/schemaDefinitions";

export default async function addresses(app: FastifyInstance) {
  app.get<{ Reply: ProvidersList }>(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Addresses"],
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

  //   app.post<{ Body: CreateProvider; Reply: { id: string } }>(
  //     "/",
  //     {
  //       preValidation: app.verifyUser,
  //       schema: {
  //         tags: ["Addresses"],
  //         body: CreateProvider,
  //         response: {
  //           200: Type.Object({
  //             id: Type.String(),
  //           }),
  //         },
  //       },
  //     },
  //     async (request, reply) => {
  //       const userId = request.user?.id;
  //       const { name, type, data } = request.body;

  //       const result = await app.pg.query(
  //         `
  //         INSERT INTO payment_providers (user_id, provider_name, provider_type, status, provider_data)
  //         VALUES ($1, $2, $3, $4, $5) RETURNING provider_id as id
  //             `,
  //         [userId, name, type, "connected", data],
  //       );

  //       reply.send({ id: result.rows[0].id });
  //     },
  //   );

  //   app.get<{ Reply: Provider | Error; Params: ParamsWithProviderId }>(
  //     "/:providerId",
  //     {
  //       preValidation: app.verifyUser,
  //       schema: {
  //         tags: ["Addresses"],
  //         response: {
  //           200: Type.Object({
  //             id: Type.String(),
  //             name: Type.String(),
  //             type: Type.String(),
  //             data: Type.Any(),
  //             status: Type.String(),
  //           }),
  //           400: HttpError,
  //         },
  //       },
  //     },
  //     async (request, reply) => {
  //       const userId = request.user?.id;
  //       const { providerId } = request.params;

  //       let result;
  //       try {
  //         result = await app.pg.query(
  //           `
  //           SELECT
  //             provider_id as id,
  //             provider_name as name,
  //             provider_type as type,
  //             provider_data as data,
  //             status
  //           FROM payment_providers
  //           WHERE provider_id = $1
  //           AND user_id = $2
  //           `,
  //           [providerId, userId],
  //         );
  //       } catch (err) {
  //         app.log.error((err as Error).message);
  //       }

  //       if (!result?.rows.length) {
  //         throw app.httpErrors.notFound("The requested provider was not found");
  //       }

  //       reply.send(result.rows[0]);
  //     },
  //   );

  //   app.put<{ Body: UpdateProvider; Params: ParamsWithProviderId }>(
  //     "/:providerId",
  //     {
  //       preValidation: app.verifyUser,
  //       schema: {
  //         tags: ["Providers"],
  //         body: UpdateProvider,
  //         response: {
  //           200: Type.Object({
  //             ok: Type.Boolean(),
  //           }),
  //         },
  //       },
  //     },
  //     async (request, reply) => {
  //       const userId = request.user?.id;
  //       const { providerId } = request.params;
  //       const { name, data, status } = request.body;

  //       await app.pg.query(
  //         `
  //           UPDATE payment_providers
  //           SET provider_name = $1,
  //             provider_data = $2,
  //             status = $3
  //           WHERE provider_id = $4
  //           AND user_id = $5
  //         `,
  //         [name, data, status, providerId, userId],
  //       );

  //       reply.send();
  //     },
  //   );
}
