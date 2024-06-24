import { Type } from "@sinclair/typebox";
import { FastifyInstance } from "fastify";
import { EmailProvider, mailService } from "./services";
import {
  isLifeEventsError,
  NotFoundError,
  ServerError,
  ValidationError,
} from "shared-errors";
import { organisationId } from "../../utils";
import { isNativeError } from "util/types";
import { HttpError } from "../../types/httpErrors";
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
  ssl: Type.Boolean(),
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
          "4xx": HttpError,
          "5xx": HttpError,
        },
      },
    },
    async function handler() {
      const client = await app.pg.pool.connect();
      const service = mailService(client);
      try {
        return { data: await service.getProviders(organisationId) };
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
          organisationId,
          request.params.providerId,
        );
        if (!data) {
          throw new NotFoundError(
            EMAIL_PROVIDER_ERROR,
            "email provider not found",
          );
        }
        return { data };
      } catch (err) {
        throw new ServerError(
          EMAIL_PROVIDER_ERROR,
          "failed to get email provider",
        );
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
          "4xx": HttpError,
          "5xx": HttpError,
        },
      },
    },
    async function createEmailProviderHandler(request, reply) {
      const client = await app.pg.pool.connect();
      const service = mailService(client);

      try {
        const id = await service.createProvider(organisationId, request.body);

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
          "4xx": HttpError,
          "5xx": HttpError,
        },
      },
    },
    async function updateEmailProviderHandler(request, _reply) {
      const client = await app.pg.pool.connect();
      const service = mailService(client);
      try {
        const placeholderOrganisationId = organisationId;
        await service.updateProvider(placeholderOrganisationId, request.body);
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
          "4xx": HttpError,
          "5xx": HttpError,
        },
      },
    },
    async function handler(request, _reply) {
      const client = await app.pg.pool.connect();
      const service = mailService(client);

      try {
        await service.deleteProvider(organisationId, request.params.providerId);
      } catch (err) {
        throw new ServerError(
          EMAIL_PROVIDER_ERROR,
          "failed to delete provider",
        );
      } finally {
        client.release();
      }
    },
  );
}
