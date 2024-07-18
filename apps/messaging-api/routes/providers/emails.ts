import { Type } from "@sinclair/typebox";
import { FastifyInstance } from "fastify";
import { EmailProvider, mailService } from "./services";
import { NotFoundError } from "shared-errors";
import { HttpError } from "../../types/httpErrors";
import { Permissions } from "../../types/permissions";
import { getGenericResponseSchema } from "../../types/schemaDefinitions";

const tags = ["Providers - Emails"];

export const EMAIL_PROVIDER_ERROR = "EMAIL_PROVIDER_ERROR";

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
  ssl: Type.Boolean(),
  isPrimary: Type.Boolean(),
});

const EmailProviderWithoutIdType = Type.Object({
  name: Type.String(),
  host: Type.String(),
  port: Type.Number(),
  username: Type.String(),
  password: Type.String(),
  throttle: Type.Optional(Type.Number()),
  fromAddress: Type.String(),
  ssl: Type.Boolean(),
  isPrimary: Type.Boolean(),
});

export default async function emails(app: FastifyInstance) {
  app.get(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Provider.Read]),
      schema: {
        tags,
        response: {
          200: getGenericResponseSchema(Type.Array(EmailProviderType)),
          "4xx": HttpError,
          "5xx": HttpError,
        },
      },
    },
    async function handler(request) {
      const client = await app.pg.pool.connect();
      const service = mailService(client);
      try {
        return {
          data: await service.getProviders(request.userData!.organizationId!),
        };
      } finally {
        client.release();
      }
    },
  );

  app.get<GetEmailProvider>(
    "/:providerId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Provider.Read]),
      schema: {
        tags,
        response: {
          200: getGenericResponseSchema(EmailProviderType),
          404: HttpError,
          500: HttpError,
        },
      },
    },
    async function handler(request, _reply) {
      const client = await app.pg.pool.connect();
      const service = mailService(client);
      try {
        const data = await service.getProvider(
          request.userData!.organizationId!,
          request.params.providerId,
        );
        if (!data) {
          throw new NotFoundError(
            EMAIL_PROVIDER_ERROR,
            "email provider not found",
          );
        }
        return { data };
      } finally {
        client.release();
      }
    },
  );

  app.post<CreateEmailProvider>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Provider.Write]),
      schema: {
        tags,
        body: EmailProviderWithoutIdType,
        response: {
          201: Type.Object({
            data: Type.Object({
              id: Type.String({ format: "uuid" }),
            }),
          }),
          "4xx": HttpError,
          "5xx": HttpError,
        },
      },
    },
    async function createEmailProviderHandler(request, reply) {
      const client = await app.pg.pool.connect();
      const service = mailService(client);

      try {
        const id = await service.createProvider(
          request.userData!.organizationId!,
          request.body,
        );

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
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Provider.Write]),
      schema: {
        tags,
        body: EmailProviderType,
        response: {
          "4xx": HttpError,
          "5xx": HttpError,
        },
      },
    },
    async function updateEmailProviderHandler(request, _reply) {
      const client = await app.pg.pool.connect();
      const service = mailService(client);
      try {
        await service.updateProvider(
          request.userData!.organizationId!,
          request.body,
        );
      } finally {
        client.release();
      }
    },
  );

  app.delete<GetEmailProvider>(
    "/:providerId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Provider.Delete]),
      schema: {
        tags,
        response: {
          "4xx": HttpError,
          "5xx": HttpError,
        },
      },
    },
    async function handler(request, _reply) {
      const client = await app.pg.pool.connect();
      const service = mailService(client);

      try {
        await service.deleteProvider(
          request.userData!.organizationId!,
          request.params.providerId,
        );
      } finally {
        client.release();
      }
    },
  );
}
