import { FastifyInstance } from "fastify";
import { Static, Type } from "@sinclair/typebox";
import { httpErrors } from "@fastify/sensible";
import { HttpError } from "../../types/httpErrors";

const Provider = Type.Union([
  Type.Object({
    id: Type.String(),
    name: Type.String(),
    type: Type.Union([
      Type.Literal("banktransfer"),
      Type.Literal("openbanking"),
      Type.Literal("stripe"),
    ]),
    data: Type.Any(),
    status: Type.Union([
      Type.Literal("connected"),
      Type.Literal("disconnected"),
    ]),
  }),
]);
type ProviderType = Static<typeof Provider>;

const CreateProvider = Type.Omit(Provider, ["id", "status"]);
type CreateProviderType = Static<typeof CreateProvider>;

const ProvidersList = Type.Union([Type.Array(Provider)]);
type ProvidersListType = Static<typeof ProvidersList>;

const UpdateProvider = Type.Omit(Provider, ["id", "type"]);
type UpdateProviderType = Static<typeof UpdateProvider>;

const ParamsWithProviderId = Type.Object({
  providerId: Type.String(),
});
type ParamsWithProviderId = Static<typeof ParamsWithProviderId>;

export default async function providers(app: FastifyInstance) {
  app.post<{ Body: CreateProviderType; Reply: { id: string } }>(
    "/",
    {
      preValidation: app.verifyUser,
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

  app.get<{ Reply: ProvidersListType }>(
    "/",
    {
      preValidation: app.verifyUser,
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
      console.log("auth token 2", request.headers["x-logto-auth"]);

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

  app.get<{ Reply: ProviderType | Error; Params: ParamsWithProviderId }>(
    "/:providerId",
    {
      preValidation: app.verifyUser,
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

  app.put<{ Body: UpdateProviderType; Params: ParamsWithProviderId }>(
    "/:providerId",
    {
      preValidation: app.verifyUser,
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
