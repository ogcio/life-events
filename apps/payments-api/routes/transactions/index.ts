import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import {
  CreateTransactionBody,
  GenericResponse,
  Id,
  PaginationParams,
  ParamsWithTransactionId,
  PaymentIntentId,
  TransactionDetails,
  Transactions,
  UpdateTransactionBody,
} from "../schemas";
import { Type } from "@sinclair/typebox";
import {
  PAGINATION_LIMIT_DEFAULT,
  PAGINATION_OFFSET_DEFAULT,
  PaginationDetails,
} from "../../utils/pagination";
import { formatAPIResponse } from "../../utils/responseFormatter";
import { GenericResponse as GenericResponseType } from "../../types/genericResponse";
import { PaginationParams as PaginationParamsType } from "../../types/pagination";
import {
  CreateTransactionBodyDO,
  TransactionDetailsDO,
  UpdateTransactionBodyDO,
} from "../../plugins/entities/transactions/types";
import { TransactionStatusesEnum } from "../../plugins/entities/transactions";

export default async function transactions(app: FastifyInstance) {
  app.get<{
    Reply: GenericResponseType<TransactionDetailsDO> | Error;
    Params: ParamsWithTransactionId;
  }>(
    "/:transactionId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, ["payments:transaction:*"]),
      schema: {
        tags: ["Transactions"],
        response: {
          200: GenericResponse(TransactionDetails),
          404: HttpError,
        },
      },
    },
    async (request, reply) => {
      const { transactionId } = request.params;

      const transactionDetails =
        await app.transactions.getTransactionById(transactionId);

      reply.send(formatAPIResponse(transactionDetails));
    },
  );

  app.get<{
    Reply: GenericResponseType<Transactions> | Error;
    Querystring: PaginationParamsType;
  }>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, ["payments:transaction:*"]),
      schema: {
        tags: ["Transactions"],
        querystring: PaginationParams,
        response: {
          200: GenericResponse(Transactions),
          401: HttpError,
          404: HttpError,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const {
        offset = PAGINATION_OFFSET_DEFAULT,
        limit = PAGINATION_LIMIT_DEFAULT,
      } = request.query;
      const userId = request.userData?.userId;

      if (!userId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      const transactions = await app.transactions.getTransactions(userId, {
        offset,
        limit,
      });
      const totalCount =
        await app.transactions.getTransactionsTotalCount(userId);
      const url = request.url.split("?")[0];

      const paginationDetails: PaginationDetails = {
        offset,
        limit,
        totalCount,
        url: url,
      };

      reply.send(formatAPIResponse(transactions, paginationDetails));
    },
  );

  app.patch<{
    Body: UpdateTransactionBodyDO;
    Reply: {};
    Params: ParamsWithTransactionId;
  }>(
    "/:transactionId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(
          req,
          res,
          ["payments:transaction.self:write", "payments:transaction:*"],
          {
            method: "OR",
          },
        ),
      schema: {
        tags: ["Transactions"],
        body: UpdateTransactionBody,
        response: {
          200: Type.Object({}),
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const { transactionId } = request.params;
      const { status } = request.body;

      await app.transactions.updateTransactionStatus(
        transactionId,
        status as TransactionStatusesEnum,
      );

      reply.send();
    },
  );

  app.post<{
    Body: CreateTransactionBodyDO;
    Reply: GenericResponseType<Id> | Error;
  }>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, ["payments:transaction.self:write"]),
      schema: {
        tags: ["Transactions"],
        body: CreateTransactionBody,
        response: {
          200: GenericResponse(Id),
          401: HttpError,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.userData?.userId;

      if (!userId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      const result = await app.transactions.createTransaction(
        userId,
        request.body,
      );
      reply.send(
        formatAPIResponse({
          id: result.transactionId,
        }),
      );
    },
  );

  app.get<{
    Reply: GenericResponseType<PaymentIntentId> | Error;
  }>(
    "/generatePaymentIntentId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, ["payments:transaction.self:write"]),
      schema: {
        tags: ["Transactions"],
        response: {
          200: GenericResponse(PaymentIntentId),
          404: HttpError,
        },
      },
    },
    async (request, reply) => {
      const result = await app.transactions.generatePaymentIntentId();
      reply.send(formatAPIResponse(result));
    },
  );
}
