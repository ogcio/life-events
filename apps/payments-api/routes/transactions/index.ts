import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import {
  CreateTransactionBody,
  GenericResponse,
  Id,
  PaginationParams,
  ParamsWithTransactionId,
  PaymentIntentId,
  transactionDataJsonSchema,
  transactionDataSchema,
  TransactionData,
  TransactionDetails,
  Transactions,
  UpdateTransactionBody,
  TokenObject,
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
  TransactionDataDO,
  TransactionDetailsDO,
  UpdateTransactionBodyDO,
} from "../../plugins/entities/transactions/types";
import { TransactionStatusesEnum } from "../../plugins/entities/transactions";
import { authPermissions } from "../../types/authPermissions";
import { AuditLogEventType } from "../../plugins/auditLog/auditLogEvents";
import { getJourneyDetails } from "../../services/getJourney";
import { createSignedJWT } from "api-auth";
import { keyAlias } from "../../utils/kms";

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
          200: GenericResponse(TransactionDetails),
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

  app.get(
    "/schema",
    {
      schema: {
        tags: TAGS,
        response: {
          200: transactionDataJsonSchema,
        },
      },
    },
    async (_, reply) => {
      reply.send(transactionDataSchema);
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

      const transactionBody = request.body;
      const journeyId = request.body.metadata.journeyId;
      if (journeyId) {
        const journeyDetails = await getJourneyDetails(journeyId);
        if (!journeyDetails)
          throw app.httpErrors.notFound("Journey not found!");
        transactionBody.metadata.journeyTitle = journeyDetails.title;
      }

      const result = await app.transactions.createTransaction(
        userId,
        transactionBody,
      );

      const orgIdResult =
        await app.paymentRequest.getOrganizationIdFromPaymentRequest(
          transactionBody.paymentRequestId,
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

  // Transaction data for integrator
  app.get<{
    Reply: GenericResponseType<TransactionDataDO> | Error;
    Params: ParamsWithTransactionId;
  }>(
    "/data/:transactionId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.TRANSACTION_READ]),
      schema: {
        tags: TAGS,
        response: {
          200: GenericResponse(TransactionData),
          404: HttpError,
        },
      },
    },
    async (request, reply) => {
      const { transactionId } = request.params;

      const transactionDetails =
        await app.transactions.getTransactionData(transactionId);

      reply.send(formatAPIResponse(transactionDetails));
    },
  );

  app.get<{
    Reply: GenericResponseType<unknown> | Error;
    Params: ParamsWithTransactionId;
  }>(
    "/:transactionId/token",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.TRANSACTION_SELF_READ]),
      schema: {
        response: {
          200: GenericResponse(TokenObject),
          401: HttpError,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.userData?.userId;
      const { transactionId } = request.params;

      if (!userId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      const transactionDetails = await app.transactions.getTransactionById(
        transactionId,
        userId,
      );

      const jwt = await createSignedJWT(
        {
          userId: userId,
          transactionId: transactionDetails.transactionId,
        },
        keyAlias,
        {
          issuer: "payments-api",
          audience: "integrator-api",
        },
      );

      reply.send(formatAPIResponse({ token: jwt }));
    },
  );
}
