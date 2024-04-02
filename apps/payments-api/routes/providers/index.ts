import { FastifyInstance } from "fastify";
import { Static, Type } from "@sinclair/typebox";

const ProviderTypes = Type.Union([
  Type.Literal("banktransfer"),
  Type.Literal("openbanking"),
  Type.Literal("stripe"),
]);

export const CreateProvider = Type.Union([
  Type.Object({
    name: Type.String(),
    type: ProviderTypes,
    providerData: Type.Object({}),
  }),
]);

export type CreateProviderType = Static<typeof CreateProvider>;

export const Provider = Type.Union([
  Type.Object({
    providerId: Type.String(),
    providerName: Type.String(),
    providerType: ProviderTypes,
    providerData: Type.Object({}),
    status: Type.Union([
      Type.Literal("connected"),
      Type.Literal("disconnected"),
    ]),
  }),
]);

export const ProvidersList = Type.Union([Type.Array(Provider)]);

export type ProvidersListType = Static<typeof ProvidersList>;

export default async function providers(app: FastifyInstance) {
  app.post<{ Body: CreateProviderType; Reply: { id: string } }>(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Providers"],
        body: CreateProvider,
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;
      const { name, type, providerData } = request.body;

      const result = await app.pg.query(
        `
        INSERT INTO payment_providers (user_id, provider_name, provider_type, status, provider_data)
        VALUES ($1, $2, $3, $4, $5) RETURNING provider_id as id
            `,
        [userId, name, type, "connected", providerData],
      );

      reply.send({ id: result.rows[0].id });
    },
  );

  app.get<{ Reply: ProvidersListType }>(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Providers"],
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                providerId: {
                  type: "string",
                },
                providerName: {
                  type: "string",
                },
                providerType: {
                  type: "string",
                },
                providerData: {
                  type: "object",
                },
                status: {
                  type: "string",
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;

      const result = await app.pg.query(
        `
          SELECT
            provider_id as "providerId",
            provider_name as "providerName",
            provider_type as "providerType",
            provider_data as "providerData",
            status
          FROM payment_providers
          WHERE user_id = $1
        `,
        [userId],
      );

      reply.send(result.rows);
    },
  );
}
