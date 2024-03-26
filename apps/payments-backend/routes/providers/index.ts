import { FastifyInstance } from "fastify";
import { Static, Type } from "@sinclair/typebox";

// There is a bug in the client generation
// It generates the type correctly
// But then it enforce to use the last in the union
// export const Provider = Type.Union([
//   Type.Object({
//     name: Type.String(),
//     type: Type.Literal("banktransfer"),
//     providerData: Type.Object({
//       sortCode: Type.String(),
//       accountNumber: Type.String(),
//       accountHolderName: Type.String(),
//     }),
//   }),
//   Type.Object({
//     name: Type.String(),
//     type: Type.Literal("stripe"),
//     providerData: Type.Object({
//       stripeAccountId: Type.String(),
//       stripeAccountSecret: Type.String(),
//     }),
//   }),
// ]);

export const Provider = Type.Union([
  Type.Object({
    name: Type.String(),
    type: Type.Union([
      Type.Literal("banktransfer"),
      Type.Literal("openbanking"),
      Type.Literal("stripe"),
    ]),
    providerData: Type.Object({}),
  }),
]);

export type ProviderType = Static<typeof Provider>;

export default async function providers(app: FastifyInstance) {
  app.post<{ Body: ProviderType; Reply: { id: string } }>(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Providers"],
        body: Provider,
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
}
