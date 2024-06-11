import { Type } from "@sinclair/typebox";
import { createError } from "@fastify/error";
import { FastifyInstance } from "fastify";
import { EmailProvider, mailService } from "./services";
const tags = ["Providers - Emails"];

const EMAIL_PROVIDER_ERROR = "EMAIL_PROVIDER_ERROR";

interface GetEmailProvider {
  Params: {
    providerId: string;
  };
}

interface CreateEmailProvider {
  Body: Omit<EmailProvider, "id">;
  201: { data: { id: number } };
}

interface UpdateEmailProvider {
  Body: EmailProvider;
  Params: {
    providerId: string;
  };
}

const EmailProviderType = Type.Object({
  id: Type.String({ format: "uuid" }),
  name: Type.String(),
  host: Type.String(),
  port: Type.Number(),
  username: Type.String(),
  password: Type.String(),
  throttle: Type.Optional(Type.Number()),
  fromAddress: Type.String(),
});

const EmailProviderWithoutIdType = Type.Object({
  name: Type.String(),
  host: Type.String(),
  port: Type.Number(),
  username: Type.String(),
  password: Type.String(),
  throttle: Type.Optional(Type.Number()),
  fromAddress: Type.String(),
});

export default async function emails(app: FastifyInstance) {
  app.get(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        tags,
        response: {
          200: Type.Object({
            data: Type.Array(EmailProviderType),
          }),
          "4xx": { $ref: "HttpError" },
          "5xx": { $ref: "HttpError" },
        },
      },
    },
    async function handler() {
      const client = await app.pg.connect();
      const service = await mailService(client);
      try {
        return { data: await service.getProviders() };
      } finally {
        client.release();
      }
    },
  );

  app.get<GetEmailProvider>(
    "/:providerId",
    {
      preValidation: app.verifyUser,
      schema: {
        tags,
        response: {
          200: Type.Object({
            data: EmailProviderType,
          }),
          404: { $ref: "HttpError" },
          500: { $ref: "HttpError" },
        },
      },
    },
    async function handler(request, _reply) {
      const client = await app.pg.connect();
      const service = await mailService(client);
      try {
        const data = await service.getProvider(request.params.providerId);
        if (!data) {
          throw createError(
            EMAIL_PROVIDER_ERROR,
            "email provider not found",
            404,
          )();
        }
        return { data };
      } catch (err) {
        throw createError(
          EMAIL_PROVIDER_ERROR,
          "failed to get email provider",
          500,
        )();
      } finally {
        client.release();
      }
    },
  );

  app.post<CreateEmailProvider>(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        tags,
        body: EmailProviderWithoutIdType,
        response: {
          201: Type.Object({
            data: Type.Object({
              id: Type.String({ format: "uuid" }),
            }),
          }),
          "4xx": { $ref: "HttpError" },
          "5xx": { $ref: "HttpError" },
        },
      },
    },
    async function handler(request, reply) {
      const client = await app.pg.connect();
      const service = await mailService(client);
      try {
        const id = await service.createProvider(request.body);
        if (!id) {
          throw createError(
            EMAIL_PROVIDER_ERROR,
            "failed to create provider",
            500,
          )();
        }

        reply.statusCode = 201;
        const data = { id };
        return { data };
      } finally {
        client.release();
      }
    },
  );

  app.put<UpdateEmailProvider>(
    "/:providerId",
    {
      preValidation: app.verifyUser,
      schema: {
        tags,
        body: EmailProviderType,
        response: {
          "4xx": { $ref: "HttpError" },
          "5xx": { $ref: "HttpError" },
        },
      },
    },
    async function handler(request, _reply) {
      const client = await app.pg.connect();
      const service = await mailService(client);
      try {
        await service.updateProvider(request.body);
      } catch (err) {
        throw createError(
          EMAIL_PROVIDER_ERROR,
          "failed to update email provider",
          500,
        )();
      } finally {
        client.release();
      }
    },
  );

  app.delete<GetEmailProvider>(
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
    async function handler(request, _reply) {
      const client = await app.pg.connect();
      const service = await mailService(client);
      try {
        await service.deleteProvider(request.params.providerId);
      } catch (err) {
        throw createError(
          EMAIL_PROVIDER_ERROR,
          "failed to delete provider",
          500,
        )();
      } finally {
        client.release();
      }
    },
  );
}
