import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import {
  CreateTransactionBody,
  GenericResponseSchema,
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
import { authPermissions } from "../../types/authPermissions";
import { AuditLogEventType } from "../../plugins/auditLog/auditLogEvents";

const TAGS = ["Transactions"];

export default async function transactions(app: FastifyInstance) {
  app.get<{
    Reply: GenericResponseType<TransactionDetailsDO> | Error;
    Params: ParamsWithTransactionId;
  }>(
    "/:transactionId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.TRANSACTION_ALL]),
      schema: {
        tags: TAGS,
        response: {
          200: GenericResponseSchema(TransactionDetails),
          404: HttpError,
        },
      },
    },
    async (request, reply) => {
      const organizationId = request.userData?.organizationId;
      const { transactionId } = request.params;

      const transactionDetails = await app.transactions.getTransactionById(
        transactionId,
        undefined,
        organizationId,
      );

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
        app.checkPermissions(req, res, [authPermissions.TRANSACTION_ALL]),
      schema: {
        tags: TAGS,
        querystring: PaginationParams,
        response: {
          200: GenericResponseSchema(Transactions),
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
      const organizationId = request.userData?.organizationId;

      if (!organizationId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      const transactions = await app.transactions.getTransactions(
        organizationId,
        {
          offset,
          limit,
        },
      );
      const totalCount =
        await app.transactions.getTransactionsTotalCount(organizationId);
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
        app.checkPermissions(req, res, [
          authPermissions.TRANSACTION_SELF_WRITE,
          authPermissions.TRANSACTION_ALL,
        ]),
      schema: {
        tags: TAGS,
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
      const userId = request.userData?.userId;

      const { extPaymentId } = await app.transactions.updateTransactionStatus(
        transactionId,
        status as TransactionStatusesEnum,
      );

      const paymentRequestIdResult =
        await app.transactions.getPaymentRequestIdFromTransaction(
          transactionId,
        );
      const orgIdResult =
        await app.paymentRequest.getOrganizationIdFromPaymentRequest(
          paymentRequestIdResult.paymentRequestId,
        );
      app.auditLog.createEvent({
        eventType: AuditLogEventType.TRANSACTION_STATUS_UPDATE,
        userId,
        organizationId: orgIdResult.organizationId,
        metadata: {
          resource: {
            type: "transaction",
            id: extPaymentId,
          },
        },
      });

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
        app.checkPermissions(req, res, [
          authPermissions.TRANSACTION_SELF_WRITE,
        ]),
      schema: {
        tags: TAGS,
        body: CreateTransactionBody,
        response: {
          200: GenericResponseSchema(Id),
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

      const orgIdResult =
        await app.paymentRequest.getOrganizationIdFromPaymentRequest(
          request.body.paymentRequestId,
        );

      app.auditLog.createEvent({
        eventType: AuditLogEventType.TRANSACTION_CREATE,
        userId,
        organizationId: orgIdResult.organizationId,
        metadata: {
          resource: {
            type: "transaction",
            id: result.extPaymentId,
          },
        },
      });

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
        app.checkPermissions(req, res, [
          authPermissions.TRANSACTION_SELF_WRITE,
        ]),
      schema: {
        tags: TAGS,
        response: {
          200: GenericResponseSchema(PaymentIntentId),
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
