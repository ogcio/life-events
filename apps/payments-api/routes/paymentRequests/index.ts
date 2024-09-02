import { FastifyInstance } from "fastify";
import { Type } from "@sinclair/typebox";
import { HttpError } from "../../types/httpErrors";
import {
  CreatePaymentRequest,
  EditPaymentRequest,
  GenericResponse,
  Id,
  PaginationParams,
  ParamsWithPaymentRequestId,
  PaymentRequest,
  PaymentRequestDetails,
  Transaction,
} from "../schemas";
import {
  PAGINATION_LIMIT_DEFAULT,
  PAGINATION_OFFSET_DEFAULT,
  PaginationDetails,
} from "../../utils/pagination";
import { formatAPIResponse } from "../../utils/responseFormatter";
import { PaginationParams as PaginationParamsType } from "../../types/pagination";
import { GenericResponse as GenericResponseType } from "../../types/genericResponse";
import { TransactionDO } from "../../plugins/entities/transactions/types";
import { authPermissions } from "../../types/authPermissions";
import {
  CreatePaymentRequestDO,
  EditPaymentRequestDO,
  ParamsWithPaymentRequestIdDO,
  PaymentRequestDetailsDO,
  PaymentRequestDO,
} from "../../plugins/entities/paymentRequest/types";
import { AuditLogEventType } from "../../plugins/auditLog/auditLogEvents";

const TAGS = ["PaymentRequests"];

export default async function paymentRequests(app: FastifyInstance) {
  app.get<{
    Reply: GenericResponseType<PaymentRequestDO[]>;
    Querystring: PaginationParamsType;
  }>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.PAYMENT_REQUEST_ALL]),
      schema: {
        tags: TAGS,
        querystring: PaginationParams,
        response: { 200: GenericResponse(Type.Array(PaymentRequest)) },
      },
    },
    async (request, reply) => {
      const organizationId = request.userData?.organizationId;
      const {
        offset = PAGINATION_OFFSET_DEFAULT,
        limit = PAGINATION_LIMIT_DEFAULT,
      } = request.query;

      if (!organizationId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      const result = await app.paymentRequest.getPaymentRequests(
        organizationId,
        {
          offset,
          limit,
        },
      );

      const totalCount =
        await app.paymentRequest.getPaymentRequestsTotalCount(organizationId);
      const url = request.url.split("?")[0];

      const paginationDetails: PaginationDetails = {
        offset,
        limit,
        totalCount,
        url: url,
      };

      reply.send(formatAPIResponse(result, paginationDetails));
    },
  );

  app.get<{
    Reply: PaymentRequestDetailsDO | Error;
    Params: ParamsWithPaymentRequestIdDO;
  }>(
    "/:requestId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.PAYMENT_REQUEST_ALL]),
      schema: {
        tags: TAGS,
        params: ParamsWithPaymentRequestId,
        response: {
          200: PaymentRequestDetails,
          404: HttpError,
        },
      },
    },
    async (request, reply) => {
      const organizationId = request.userData?.organizationId;
      const { requestId } = request.params;

      if (!organizationId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      const result = await app.paymentRequest.getPaymentRequestById(
        requestId,
        organizationId,
      );

      reply.send(result);
    },
  );

  app.get<{
    Reply: PaymentRequestDetailsDO | Error;
    Params: ParamsWithPaymentRequestIdDO;
  }>(
    "/:requestId/public-info",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [
          authPermissions.PAYMENT_REQUEST_PUBLIC_READ,
        ]),
      schema: {
        tags: TAGS,
        params: ParamsWithPaymentRequestId,
        response: {
          200: PaymentRequestDetails,
          404: HttpError,
        },
      },
    },
    async (request, reply) => {
      const { requestId } = request.params;

      const result =
        await app.paymentRequest.getPaymentRequestPublicInfo(requestId);

      reply.send(result);
    },
  );

  app.post<{ Body: CreatePaymentRequestDO; Reply: Id | Error }>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.PAYMENT_REQUEST_ALL]),
      schema: {
        tags: TAGS,
        body: CreatePaymentRequest,
        response: { 200: Id },
      },
    },
    async (request, reply) => {
      const userId = request.userData?.userId;
      const organizationId = request.userData?.organizationId;

      if (!userId || !organizationId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      const requestId = await app.paymentRequest.createPaymentRequest(
        request.body,
        userId,
        organizationId,
      );

      app.auditLog.createEvent({
        eventType: AuditLogEventType.PAYMENT_REQUEST_CREATE,
        userId,
        organizationId,
        metadata: {},
      });

      reply.send(requestId);
    },
  );

  app.put<{ Body: EditPaymentRequestDO; Reply: Id | Error }>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.PAYMENT_REQUEST_ALL]),
      schema: {
        tags: TAGS,
        body: EditPaymentRequest,
        response: { 200: Id },
      },
    },
    async (request, reply) => {
      const userId = request.userData?.userId;
      const organizationId = request.userData?.organizationId;

      if (!organizationId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      const requestId = await app.paymentRequest.updatePaymentRequest(
        request.body,
        organizationId,
      );

      app.auditLog.createEvent({
        eventType: AuditLogEventType.PAYMENT_REQUEST_UPDATE,
        userId,
        organizationId,
        metadata: {},
      });

      reply.send(requestId);
    },
  );

  app.delete<{
    Reply: {} | Error;
    Params: ParamsWithPaymentRequestIdDO;
  }>(
    "/:requestId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.PAYMENT_REQUEST_ALL]),
      schema: {
        tags: TAGS,
        response: {
          200: Type.Object({}),
          404: HttpError,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.userData?.userId;
      const organizationId = request.userData?.organizationId;
      const { requestId } = request.params;

      if (!organizationId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      const transactionsCount =
        await app.transactions.getPaymentRequestTransactionsTotalCount(
          requestId,
          organizationId,
        );

      if (transactionsCount > 0) {
        throw app.httpErrors.internalServerError(
          "Payment request with existing transactions cannot be deleted",
        );
      }

      await app.paymentRequest.deletePaymentRequest(requestId, organizationId);

      app.auditLog.createEvent({
        eventType: AuditLogEventType.PAYMENT_REQUEST_DELETE,
        userId,
        organizationId,
        metadata: {},
      });

      reply.send();
    },
  );

  app.get<{
    Reply: GenericResponseType<TransactionDO[]>;
    Params: ParamsWithPaymentRequestIdDO;
    Querystring: PaginationParamsType;
  }>(
    "/:requestId/transactions",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.PAYMENT_REQUEST_ALL]),
      schema: {
        tags: ["Transactions"],
        querystring: PaginationParams,
        response: {
          200: GenericResponse(Type.Array(Transaction)),
        },
      },
    },
    async (request, reply) => {
      const organizationId = request.userData?.organizationId;
      const { requestId } = request.params;
      const {
        offset = PAGINATION_OFFSET_DEFAULT,
        limit = PAGINATION_LIMIT_DEFAULT,
      } = request.query;

      if (!organizationId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      const result = await app.transactions.getPaymentRequestTransactions(
        requestId,
        organizationId,
        {
          offset,
          limit,
        },
      );
      const totalCount =
        await app.transactions.getPaymentRequestTransactionsTotalCount(
          requestId,
          organizationId,
        );
      const url = request.url.split("?")[0];

      const paginationDetails: PaginationDetails = {
        offset,
        limit,
        totalCount,
        url: url,
      };

      reply.send(formatAPIResponse(result, paginationDetails));
    },
  );
}
