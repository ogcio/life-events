import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import {
  ProvidersList,
  UpdateProvider,
  CreateProvider,
  ProviderReply,
  OkResponse,
  Id,
} from "../schemas";
import {
  CreateProviderDO,
  ParamsWithProviderId,
  ProviderDO,
  UpdateProviderDO,
} from "../../plugins/entities/providers/types";

export default async function providers(app: FastifyInstance) {
  app.post<{ Body: CreateProviderDO; Reply: Id }>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, ["payments:provider:*"]),
      schema: {
        tags: ["Providers"],
        body: CreateProvider,
        response: {
          200: Id,
          401: HttpError,
          422: HttpError,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.userData?.userId;

      if (!userId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      const result = await app.providers.createProvider(request.body, userId);

      reply.send(result);
    },
  );

  app.get<{ Reply: ProviderDO[] }>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, ["payments:provider:*"]),
      schema: {
        tags: ["Providers"],
        response: {
          200: ProvidersList,
          401: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.userData?.userId;

      if (!userId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      const providers = await app.providers.getProvidersList(userId);

      reply.send(providers);
    },
  );

  app.get<{ Reply: ProviderDO | Error; Params: ParamsWithProviderId }>(
    "/:providerId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, ["payments:provider:*"]),
      schema: {
        tags: ["Providers"],
        response: {
          200: ProviderReply,
          401: HttpError,
          404: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.userData?.userId;
      const { providerId } = request.params;

      if (!userId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      const provider = await app.providers.getProviderById(providerId, userId);

      reply.send(provider);
    },
  );

  app.put<{
    Body: UpdateProviderDO;
    Params: ParamsWithProviderId;
    Reply: OkResponse;
  }>(
    "/:providerId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, ["payments:provider:*"]),
      schema: {
        tags: ["Providers"],
        body: UpdateProvider,
        response: {
          200: OkResponse,
          401: HttpError,
          422: HttpError,
          404: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.userData?.userId;
      const { providerId } = request.params;

      if (!userId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      await app.providers.updateProvider(providerId, request.body, userId);

      reply.send({ ok: true });
    },
  );
}
