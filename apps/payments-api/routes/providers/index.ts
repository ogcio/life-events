import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import {
  ParamsWithProviderId,
  ProvidersList,
  Provider,
  UpdateProvider,
  CreateBankTransferProvider,
  CreateOpenBankingProvider,
  CreateStripeProvider,
  CreateWorldpayProvider,
  CreateRealexProvider,
  Id,
  OkResponse,
} from "../schemas";
import { providerSecretsHandlersFactory } from "../../services/providersSecretsService";
import { DbConstrainMap, handleDbError } from "../utils";

export default async function providers(app: FastifyInstance) {
  const dbConstrainMap: DbConstrainMap = {
    unique_provider_name: {
      field: "providerName",
      message: "Provider's name must be unique!",
    },
  };

  app.post<{ Body: CreateBankTransferProvider; Reply: Id }>(
    "/banktransfer",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Providers"],
        body: CreateBankTransferProvider,
        response: { 200: Id },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;
      const { name, type, data } = request.body;

      try {
        const result = await app.pg.query(
          `
          INSERT INTO payment_providers (user_id, provider_name, provider_type, status, provider_data)
          VALUES ($1, $2, $3, $4, $5) RETURNING provider_id as id
              `,
          [userId, name, type, "connected", data],
        );

        reply.send({ id: result.rows[0].id });
      } catch (err) {
        app.log.error((err as Error).message);
        handleDbError(err, dbConstrainMap);
      }
    },
  );

  app.post<{ Body: CreateOpenBankingProvider; Reply: Id }>(
    "/openbanking",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Providers"],
        body: CreateOpenBankingProvider,
        response: { 200: Id },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;
      const { name, type, data } = request.body;

      try {
        const result = await app.pg.query(
          `
          INSERT INTO payment_providers (user_id, provider_name, provider_type, status, provider_data)
          VALUES ($1, $2, $3, $4, $5) RETURNING provider_id as id
              `,
          [userId, name, type, "connected", data],
        );

        reply.send({ id: result.rows[0].id });
      } catch (err) {
        app.log.error((err as Error).message);
        handleDbError(err, dbConstrainMap);
      }
    },
  );

  app.post<{ Body: CreateStripeProvider; Reply: Id }>(
    "/stripe",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Providers"],
        body: CreateStripeProvider,
        response: { 200: Id },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;
      const { name, type, data } = request.body;

      const providerSecretsHandler = providerSecretsHandlersFactory(type);
      const cypheredData = providerSecretsHandler.getCypheredData(data);

      try {
        const result = await app.pg.query(
          `
          INSERT INTO payment_providers (user_id, provider_name, provider_type, status, provider_data)
          VALUES ($1, $2, $3, $4, $5) RETURNING provider_id as id
              `,
          [userId, name, type, "connected", cypheredData],
        );

        reply.send({ id: result.rows[0].id });
      } catch (err) {
        app.log.error((err as Error).message);
        handleDbError(err, dbConstrainMap);
      }
    },
  );

  app.post<{ Body: CreateWorldpayProvider; Reply: Id }>(
    "/worldpay",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Providers"],
        body: CreateWorldpayProvider,
        response: { 200: Id },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;
      const { name, type, data } = request.body;

      const providerSecretsHandler = providerSecretsHandlersFactory(type);
      const cypheredData = providerSecretsHandler.getCypheredData(data);

      try {
        const result = await app.pg.query(
          `
          INSERT INTO payment_providers (user_id, provider_name, provider_type, status, provider_data)
          VALUES ($1, $2, $3, $4, $5) RETURNING provider_id as id
              `,
          [userId, name, type, "connected", cypheredData],
        );

        reply.send({ id: result.rows[0].id });
      } catch (err) {
        app.log.error((err as Error).message);
        handleDbError(err, dbConstrainMap);
      }
    },
  );

  app.post<{ Body: CreateRealexProvider; Reply: Id }>(
    "/realex",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Providers"],
        body: CreateRealexProvider,
        response: { 200: Id },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;
      const { name, type, data } = request.body;

      const providerSecretsHandler = providerSecretsHandlersFactory(type);
      const cypheredData = providerSecretsHandler.getCypheredData(data);

      try {
        const result = await app.pg.query(
          `
          INSERT INTO payment_providers (user_id, provider_name, provider_type, status, provider_data)
          VALUES ($1, $2, $3, $4, $5) RETURNING provider_id as id
              `,
          [userId, name, type, "connected", cypheredData],
        );

        reply.send({ id: result.rows[0].id });
      } catch (err) {
        app.log.error((err as Error).message);
        handleDbError(err, dbConstrainMap);
      }
    },
  );

  app.get<{ Reply: ProvidersList }>(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Providers"],
        response: { 200: ProvidersList },
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
          ORDER BY created_at DESC
        `,
        [userId],
      );

      for (const provider of result.rows) {
        const providerSecretsHandler = providerSecretsHandlersFactory(
          provider.type,
        );
        provider.data = providerSecretsHandler.getClearTextData(provider.data);
      }

      reply.send(result.rows);
    },
  );

  app.get<{ Reply: Provider | Error; Params: ParamsWithProviderId }>(
    "/:providerId",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Providers"],
        response: {
          200: Provider,
          400: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;
      const { providerId } = request.params;

      let result;
      try {
        result = await app.pg.query(
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
      } catch (err) {
        app.log.error((err as Error).message);
      }

      if (!result?.rows.length) {
        throw app.httpErrors.notFound("The requested provider was not found");
      }

      const provider = result.rows[0];
      const providerSecretsHandler = providerSecretsHandlersFactory(
        provider.type,
      );
      provider.data = providerSecretsHandler.getClearTextData(provider.data);

      reply.send(provider);
    },
  );

  app.put<{
    Body: UpdateProvider;
    Params: ParamsWithProviderId;
    Reply: OkResponse;
  }>(
    "/:providerId",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Providers"],
        body: UpdateProvider,
        response: { 200: OkResponse },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;
      const { providerId } = request.params;
      const { name, data, status } = request.body;

      let provider;
      try {
        provider = await app.pg.query(
          `
          SELECT
            provider_id as id,
            provider_type as type
          FROM payment_providers
          WHERE provider_id = $1
          AND user_id = $2
          `,
          [providerId, userId],
        );
      } catch (err) {
        app.log.error((err as Error).message);
      }

      if (!provider?.rows.length) {
        throw app.httpErrors.notFound("The requested provider was not found");
      }

      const providerSecretsHandler = providerSecretsHandlersFactory(
        provider.rows[0].type,
      );
      const cypheredData = providerSecretsHandler.getCypheredData(data);

      await app.pg.query(
        `
          UPDATE payment_providers
          SET provider_name = $1,
            provider_data = $2,
            status = $3
          WHERE provider_id = $4
          AND user_id = $5
        `,
        [name, cypheredData, status, providerId, userId],
      );

      reply.send();
    },
  );
}
