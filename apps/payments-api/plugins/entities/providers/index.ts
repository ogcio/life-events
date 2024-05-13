import {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyPluginAsync,
} from "fastify";
import fp from "fastify-plugin";
import { ProvidersRepo } from "./repo";
import { ReturnType } from "@sinclair/typebox";
import secretsHandlerFactory from "../../../services/providersSecretsService";
import { HttpErrors } from "@fastify/sensible";
import { getSecretFields, mapProviderData } from "./dataMapper";
import {
  CreateProviderDO,
  ProviderData,
  ProviderDO,
  UpdateProviderDO,
} from "./types";
import { DbConstraintMap, handleDbError } from "../../../routes/utils";

export type ProvidersPlugin = Awaited<ReturnType<typeof buildPlugin>>;

const dbConstraintMap: DbConstraintMap = {
  unique_provider_name: {
    field: "providerName",
    message: "Provider's name must be unique!",
  },
};

const buildGetProviderById =
  (repo: ProvidersRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (providerId: string, userId: string): Promise<ProviderDO> => {
    let result;

    try {
      result = await repo.getProviderById(providerId, userId);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (!result?.rows.length) {
      throw httpErrors.notFound("The requested provider was not found");
    }

    const provider = result.rows[0];
    const secretFields = getSecretFields(provider.type);

    return {
      ...provider,
      data: secretsHandlerFactory
        .getInstance()
        .getClearTextData(provider.data, secretFields) as ProviderData,
    };
  };

const buildUpdateProvider =
  (repo: ProvidersRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (
    providerId: string,
    providerData: UpdateProviderDO,
    userId: string,
  ) => {
    let provider;
    try {
      provider = await repo.getProviderById(providerId, userId);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (!provider?.rows.length) {
      throw httpErrors.notFound("The requested provider was not found");
    }

    const [mappedData, mappingErrors] = mapProviderData(
      providerData.data,
      provider.rows[0].type,
    );

    if (mappingErrors.length) {
      throw httpErrors.badRequest("Provider's data is invalid!");
    }

    const secretFields = getSecretFields(provider.rows[0].type);
    const providerEncrypted = {
      ...providerData,
      data: secretsHandlerFactory
        .getInstance()
        .getCypheredData(mappedData, secretFields),
    };

    repo.updateProvider(providerId, providerEncrypted, userId);
  };

const buildGetProvidersList =
  (repo: ProvidersRepo, log: FastifyBaseLogger) =>
  async (userId: string): Promise<Array<ProviderDO>> => {
    let result;

    try {
      result = await repo.getProvidersList(userId);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (!result) {
      return [];
    }

    return result.rows.map((provider) => {
      const secretFields = getSecretFields(provider.type);
      return {
        ...provider,
        data: secretsHandlerFactory
          .getInstance()
          .getClearTextData(provider.data, secretFields) as ProviderData,
      };
    });
  };

const buildCreateProvider =
  (repo: ProvidersRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (
    createProvider: CreateProviderDO,
    userId: string,
  ): Promise<{ id: string }> => {
    let result;

    const [mappedData, mappingErrors] = mapProviderData(
      createProvider.data,
      createProvider.type,
    );

    if (mappingErrors.length) {
      throw httpErrors.badRequest("Provider's data is invalid!");
    }

    const secretFields = getSecretFields(createProvider.type);

    const providerEncrypted = {
      ...createProvider,
      data: secretsHandlerFactory
        .getInstance()
        .getCypheredData(mappedData, secretFields),
    };

    try {
      result = await repo.createProvider(providerEncrypted, userId);
    } catch (err) {
      log.error((err as Error).message);
      handleDbError(err, dbConstraintMap);
    }

    if (!result?.rowCount) {
      throw httpErrors.internalServerError("Something went wrong.");
    }

    return result?.rows[0];
  };

const buildPlugin = (
  repo: ProvidersRepo,
  log: FastifyBaseLogger,
  httpErrors: HttpErrors,
) => {
  return {
    createProvider: buildCreateProvider(repo, log, httpErrors),
    getProviderById: buildGetProviderById(repo, log, httpErrors),
    getProvidersList: buildGetProvidersList(repo, log),
    updateProvider: buildUpdateProvider(repo, log, httpErrors),
  };
};

const initPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const repo = new ProvidersRepo(fastify.pg);
  const plugin = buildPlugin(repo, fastify.log, fastify.httpErrors);

  fastify.decorate("providers", plugin);
};

export default fp(initPlugin, {
  name: "providersPlugin",
});
