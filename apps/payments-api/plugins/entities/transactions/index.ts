import { HttpErrors } from "@fastify/sensible";
import {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyPluginAsync,
} from "fastify";
import fp from "fastify-plugin";
import { TransactionsRepo } from "./repo";
import { PaginationParams } from "../../../types/pagination";
import {
  CreateTransactionBodyDO,
  TransactionDetailsDO,
  TransactionEntry,
} from "./types";

export type TransactionsPlugin = Awaited<ReturnType<typeof buildPlugin>>;

export enum TransactionStatusesEnum {
  Initiated = "initiated",
  Pending = "pending",
  Succeeded = "succeeded",
  Cancelled = "cancelled",
  Failed = "failed",
}

const buildGetTransactionById =
  (repo: TransactionsRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (
    transactionId: string,
    userId?: string,
    organizationId?: string,
  ): Promise<TransactionDetailsDO> => {
    let result;

    try {
      result = await repo.getTransactionById(
        transactionId,
        userId,
        organizationId,
      );
    } catch (err) {
      log.error((err as Error).message);
    }

    if (!result?.rowCount) {
      throw httpErrors.notFound("The requested transaction was not found");
    }

    return result?.rows[0];
  };

const buildGetTransactions =
  (repo: TransactionsRepo, log: FastifyBaseLogger) =>
  async (
    organizationId: string,
    pagination: PaginationParams,
  ): Promise<TransactionDetailsDO[]> => {
    let result;

    try {
      result = await repo.getTransactions(organizationId, pagination);
    } catch (err) {
      log.error((err as Error).message);
    }

    return result?.rows ?? [];
  };

const buildGetTransactionsTotalCount =
  (repo: TransactionsRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (organizationId: string): Promise<number> => {
    let result;

    try {
      result = await repo.getTransactionsTotalCount(organizationId);
    } catch (err) {
      log.error((err as Error).message);
    }

    const totalCount = result?.rows[0].totalCount;

    if (totalCount === undefined) {
      throw httpErrors.internalServerError("Something went wrong.");
    }

    return totalCount;
  };

const buildUpdateTransactionStatus =
  (repo: TransactionsRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (
    transactionId: string,
    status: TransactionStatusesEnum,
  ): Promise<{ transactionId: string }> => {
    let result;

    try {
      result = await repo.updateTransactionStatus(transactionId, status);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (!result?.rows[0]?.transactionId) {
      throw httpErrors.internalServerError("Something went wrong!");
    }

    return result.rows[0];
  };

const buildCreateTransaction =
  (repo: TransactionsRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (
    userId: string,
    transaction: CreateTransactionBodyDO,
  ): Promise<{ transactionId: string }> => {
    let result;

    try {
      result = await repo.createTransaction(userId, transaction);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (result?.rowCount !== 1) {
      throw httpErrors.internalServerError(
        "Cannot create payment transactions",
      );
    }

    return result.rows[0];
  };

const buildGeneratePaymentIntentId =
  (repo: TransactionsRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (): Promise<{ intentId: string }> => {
    let result;
    let execNr = 0;
    const maxTry = process.env.PAYMENT_INTENTID_MAX_TRY_GENERATION
      ? parseInt(process.env.PAYMENT_INTENTID_MAX_TRY_GENERATION)
      : 20;
    const len = process.env.PAYMENT_INTENTID_LENGTH
      ? parseInt(process.env.PAYMENT_INTENTID_LENGTH)
      : 6;

    do {
      if (execNr > maxTry) {
        throw httpErrors.notFound("Unique intentId generation failed");
      }

      result = await repo.generatePaymentIntentId(len);
      execNr++;
    } while (result.rowCount === 0);

    return result.rows[0];
  };

const buildGetPaymentRequestTransactions =
  (repo: TransactionsRepo, log: FastifyBaseLogger) =>
  async (
    paymentRequestId: string,
    organizationId: string,
    pagination: PaginationParams,
  ): Promise<TransactionDetailsDO[]> => {
    let result;

    try {
      result = await repo.getPaymentRequestTransactions(
        paymentRequestId,
        organizationId,
        pagination,
      );
    } catch (err) {
      log.error((err as Error).message);
    }

    return result?.rows ?? [];
  };

const buildGetPaymentRequestTransactionsTotalCount =
  (repo: TransactionsRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (paymentRequestId: string, organizationId: string): Promise<number> => {
    let result;

    try {
      result = await repo.getPaymentRequestTransactionsTotalCount(
        paymentRequestId,
        organizationId,
      );
    } catch (err) {
      log.error((err as Error).message);
    }

    const totalCount = result?.rows[0].totalCount;

    if (totalCount === undefined) {
      throw httpErrors.internalServerError("Something went wrong.");
    }

    return totalCount;
  };

const buildGetTransactionByExtPaymentId =
  (repo: TransactionsRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (extPaymentId: string): Promise<TransactionEntry> => {
    let result;

    try {
      result = await repo.getTransactionByExtPaymentId(extPaymentId);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (!result?.rowCount) throw httpErrors.notFound("Transaction not found");

    return result.rows[0];
  };

const buildGetPaymentRequestIdFromTransaction =
  (repo: TransactionsRepo, log: FastifyBaseLogger, httpErrors: HttpErrors) =>
  async (transactionId: string): Promise<{ paymentRequestId: string }> => {
    let result;

    try {
      result = await repo.getPaymentRequestIdFromTransaction(transactionId);
    } catch (err) {
      log.error((err as Error).message);
    }

    if (!result?.rowCount) {
      throw httpErrors.notFound("The requested transaction was not found");
    }

    return result?.rows[0];
  };

const buildPlugin = (
  repo: TransactionsRepo,
  log: FastifyBaseLogger,
  httpErrors: HttpErrors,
) => {
  return {
    getTransactionById: buildGetTransactionById(repo, log, httpErrors),
    updateTransactionStatus: buildUpdateTransactionStatus(
      repo,
      log,
      httpErrors,
    ),
    getTransactions: buildGetTransactions(repo, log),
    getTransactionsTotalCount: buildGetTransactionsTotalCount(
      repo,
      log,
      httpErrors,
    ),
    createTransaction: buildCreateTransaction(repo, log, httpErrors),
    generatePaymentIntentId: buildGeneratePaymentIntentId(
      repo,
      log,
      httpErrors,
    ),
    getPaymentRequestTransactions: buildGetPaymentRequestTransactions(
      repo,
      log,
    ),
    getPaymentRequestTransactionsTotalCount:
      buildGetPaymentRequestTransactionsTotalCount(repo, log, httpErrors),
    getTransactionByExtPaymentId: buildGetTransactionByExtPaymentId(
      repo,
      log,
      httpErrors,
    ),
    getPaymentRequestIdFromTransaction: buildGetPaymentRequestIdFromTransaction(
      repo,
      log,
      httpErrors,
    ),
  };
};

const initPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const repo = new TransactionsRepo(fastify.pg);
  const plugin = buildPlugin(repo, fastify.log, fastify.httpErrors);

  fastify.decorate("transactions", plugin);
};

export default fp(initPlugin, {
  name: "transactionsPlugin",
});
