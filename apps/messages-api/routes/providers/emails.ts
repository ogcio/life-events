import { Type } from "@sinclair/typebox";
import { FastifyInstance } from "fastify";
import { EmailProvider, mailService } from "./services";
import { buildApiError } from "../../utils";

const tags = ["Providers - Emails"];

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
  const _mailService = mailService(app);
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
        },
      },
    },
    async function handler() {
      const data = await _mailService.getProviders();
      return { data };
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
    async function handler(request, reply) {
      try {
        const data = await _mailService.getProvider(request.params.providerId);
        if (!data) {
          const error = buildApiError("email provider not found", 404);
          reply.statusCode = error.statusCode;
          return error;
        }
        return { data };
      } catch (err) {
        app.log.error(err);
        const error = buildApiError("failed to get email provider", 500);
        return error;
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
          "5xx": { $ref: "HttpError" },
        },
      },
    },
    async function handler(request, reply) {
      const id = await _mailService.createProvider(request.body);
      if (!id) {
        const error = buildApiError("failed to create provider", 500);
        reply.statusCode = error.statusCode;
        return error;
      }

      reply.statusCode = 201;
      const data = { id };
      return { data };
    },
  );
  app.put<UpdateEmailProvider>(
    "/:providerId",
    {
      preValidation: app.verifyUser,
      schema: {
        tags,
        body: EmailProviderType,
      },
    },
    async function handler(request, reply) {
      try {
        await _mailService.updateProvier(request.body);
      } catch (err) {
        app.log.error(err);
        const error = buildApiError("failed to update email provider", 500);
        reply.statusCode = error.statusCode;
        return error;
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
          500: { $ref: "HttpError" },
        },
      },
    },
    async function handler(request, reply) {
      try {
        await _mailService.deleteProvider(request.params.providerId);
      } catch (err) {
        app.log.error(err);
        const error = buildApiError("failed to delete provider", 500);
        reply.statusCode = error.statusCode;
        return error;
      }
    },
  );
}
