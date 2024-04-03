import { FastifyInstance } from "fastify";
import { Static, Type } from "@sinclair/typebox";

const ProviderTypes = Type.Union([
  Type.Literal("banktransfer"),
  Type.Literal("openbanking"),
  Type.Literal("stripe"),
]);

const CreateProvider = Type.Union([
  Type.Object({
    name: Type.String(),
    type: ProviderTypes,
    data: Type.Object({}),
  }),
]);

type CreateProviderType = Static<typeof CreateProvider>;

const Provider = Type.Union([
  Type.Object({
    id: Type.String(),
    name: Type.String(),
    type: ProviderTypes,
    data: Type.Object({}),
    status: Type.Union([
      Type.Literal("connected"),
      Type.Literal("disconnected"),
    ]),
  }),
]);

const ProvidersList = Type.Union([Type.Array(Provider)]);

type ProvidersListType = Static<typeof ProvidersList>;

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
                id: {
                  type: "string",
                },
                name: {
                  type: "string",
                },
                type: {
                  type: "string",
                },
                data: {
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
}
