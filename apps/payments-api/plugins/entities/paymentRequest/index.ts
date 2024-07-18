import {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyPluginAsync,
} from "fastify";
import fp from "fastify-plugin";
import { ReturnType } from "@sinclair/typebox";
import { HttpErrors } from "@fastify/sensible";
import { PaymentRequestRepo } from "./repo";
import { PaginationParams } from "../../../types/pagination";
import {
  CreatePaymentRequestDO,
  EditPaymentRequestDO,
  PaymentRequestDetailsDO,
  PaymentRequestDO,
} from "./types";

export type PaymentRequestPlugin = Awaited<ReturnType<typeof buildPlugin>>;

const buildGetPaymentRequests =
  (repo: PaymentRequestRepo, log: FastifyBaseLogger) =>
  async (
    organizationId: string,
    pagination: PaginationParams,
  ): Promise<PaymentRequestDO[]> => {
    let result;

    try {
      result = await repo.getPaymentRequests(organizationId, pagination);
    } catch (err) {
      log.error((err as Error).message);
    }

    return result?.rows ?? [];
  };

const buildGetPaymentRequestsTotalCount =
  (repo: PaymentRequestRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (organizationId: string): Promise<number> => {
    let result;

    try {
      result = await repo.getPaymentRequestsTotalCount(organizationId);
    } catch (err) {
      log.error((err as Error).message);
    }

    const totalCount = result?.rows[0].totalCount;

    if (totalCount === undefined) {
      throw httpErrors.internalServerError("Something went wrong.");
    }

    return totalCount;
  };

const buildGetPaymentRequestById =
  (repo: PaymentRequestRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (
    requestId: string,
    organizationId: string,
  ): Promise<PaymentRequestDetailsDO> => {
    let result;

    try {
      result = await repo.getPaymentRequestById(requestId, organizationId);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (!result?.rowCount) {
      throw httpErrors.notFound("The requested payment request was not found");
    }

    return result.rows[0];
  };

const buildGetPaymentRequestPublicInfo =
  (repo: PaymentRequestRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (requestId: string): Promise<PaymentRequestDetailsDO> => {
    let result;

    try {
      result = await repo.getPaymentRequestPublicInfo(requestId);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (!result?.rowCount) {
      throw httpErrors.notFound("The requested payment request was not found");
    }

    return result.rows[0];
  };

const buildCreatePaymentRequest =
  (repo: PaymentRequestRepo, httpErrors: HttpErrors) =>
  async (
    paymentRequest: CreatePaymentRequestDO,
    userId: string,
    organizationId: string,
  ): Promise<{ id: string }> => {
    const transaction = repo.getTransaction();
    try {
      const paymentRequestId = await transaction(async (client) => {
        const paymentRequestResult = await repo.createPaymentRequest(
          paymentRequest,
          userId,
          organizationId,
          client,
        );

        if (!paymentRequestResult.rowCount) {
          // handle creation failure
          throw new Error("Failed to create payment");
        }

        const paymentRequestId =
          paymentRequestResult.rows[0].payment_request_id;

        if (!paymentRequest.providers.length) {
          return paymentRequestId;
        }

        const paymentRequestProvidersResult =
          await repo.linkProvidersToPaymentRequest(
            paymentRequest.providers,
            paymentRequestId,
            client,
          );

        if (
          paymentRequestProvidersResult.rowCount !==
          paymentRequest.providers.length
        ) {
          // handle creation failure
          throw new Error("Failed to create payment");
        }

        return paymentRequestId;
      });

      return { id: paymentRequestId };
    } catch (err) {
      throw httpErrors.internalServerError((err as Error).message);
    }
  };

const buildUpdatePaymentRequest =
  (repo: PaymentRequestRepo, httpErrors: HttpErrors) =>
  async (
    paymentRequest: EditPaymentRequestDO,
    organizationId: string,
  ): Promise<{ id: string }> => {
    const transaction = repo.getTransaction();
    try {
      await transaction(async (client) => {
        await repo.updatePaymentRequest(paymentRequest, organizationId, client);

        if (paymentRequest.providersUpdate.toDisable.length) {
          await repo.disablePaymentRequestProviderLinkage(
            paymentRequest.paymentRequestId,
            paymentRequest.providersUpdate.toDisable,
            client,
          );
        }

        if (paymentRequest.providersUpdate.toCreate.length) {
          await repo.upsertPaymentRequestProviderLinkage(
            paymentRequest.paymentRequestId,
            paymentRequest.providersUpdate.toCreate,
            client,
          );
        }
      });

      return { id: paymentRequest.paymentRequestId };
    } catch (err) {
      throw httpErrors.internalServerError((err as Error).message);
    }
  };

const buildPlugin = (
  repo: PaymentRequestRepo,
  log: FastifyBaseLogger,
  httpErrors: HttpErrors,
) => {
  return {
    getPaymentRequests: buildGetPaymentRequests(repo, log),
    getPaymentRequestsTotalCount: buildGetPaymentRequestsTotalCount(
      repo,
      log,
      httpErrors,
    ),
    getPaymentRequestById: buildGetPaymentRequestById(repo, log, httpErrors),
    getPaymentRequestPublicInfo: buildGetPaymentRequestPublicInfo(
      repo,
      log,
      httpErrors,
    ),
    createPaymentRequest: buildCreatePaymentRequest(repo, httpErrors),
    updatePaymentRequest: buildUpdatePaymentRequest(repo, httpErrors),
  };
};

const initPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const repo = new PaymentRequestRepo(fastify.pg);
  const plugin = buildPlugin(repo, fastify.log, fastify.httpErrors);

  fastify.decorate("paymentRequest", plugin);
};

export default fp(initPlugin, {
  name: "paymentRequestPlugin",
});
