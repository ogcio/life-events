import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import {
  GenericResponseSchema,
  RealexPaymentObject,
  RealexPaymentObjectQueryParams,
  RealexStatusUpdateQueryParams,
} from "../schemas";
import { Type } from "@sinclair/typebox";
import { authPermissions } from "../../types/authPermissions";
import {
  RealexHppResponseDO,
  RealexPaymentObjectDO,
  RealexStatusEnum,
  RealexStatusUpdateDO,
} from "../../plugins/entities/providers/types";
import { formatAPIResponse } from "../../utils/responseFormatter";
import { GenericResponse } from "../../types/genericResponse";

const TAGS = ["Transactions"];

export default async function realex(app: FastifyInstance) {
  app.get<{
    Reply: GenericResponse<RealexPaymentObjectDO> | Error;
    Querystring: RealexPaymentObjectQueryParams;
  }>(
    "/paymentObject",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [
          authPermissions.TRANSACTION_SELF_WRITE,
        ]),
      schema: {
        tags: TAGS,
        querystring: RealexPaymentObjectQueryParams,
        response: {
          200: GenericResponseSchema(RealexPaymentObject),
          404: HttpError,
          422: HttpError,
        },
      },
    },
    async (request, reply) => {
      const { providerId, amount, intentId } = request.query;
      const result = await app.providers.services.realex.getPaymentObject(
        providerId,
        amount,
        intentId,
      );
      reply.send(formatAPIResponse(result));
    },
  );

  // endpoint called by Realex upon payment completion.
  // The HTML response received will be rendered by HPP. The redirect is on us
  app.post<{
    Body: RealexHppResponseDO;
    Reply: string | Error;
  }>(
    "/verifyPaymentResponse",
    {
      schema: {
        tags: TAGS,
        body: Type.Object({}),
        response: {
          200: Type.String(),
          404: HttpError,
          422: HttpError,
        },
      },
    },
    async (request, reply) => {
      const body = request.body;

      const transaction = await app.transactions.getTransactionByExtPaymentId(
        body.ORDER_ID,
      );
      const providerId = transaction.paymentProviderId;

      const result = await app.providers.services.realex.verifyPaymentResponse(
        body,
        providerId,
      );

      const transactionStatus =
        app.providers.services.realex.getTransactionStatus(
          body.RESULT as RealexStatusEnum,
        );
      await app.transactions.updateTransactionStatus(
        transaction.transactionId.toString(),
        transactionStatus,
      );

      reply.header("Content-Type", "text/html");
      reply.send(result);
    },
  );

  app.get<{
    Reply: any;
    Querystring: RealexStatusUpdateDO;
  }>(
    "/statusUpdate",
    {
      schema: {
        tags: TAGS,
        querystring: RealexStatusUpdateQueryParams,
      },
    },
    async (request, reply) => {
      const { result, orderid } = request.query;

      const transaction =
        await app.transactions.getTransactionByExtPaymentId(orderid);
      const providerId = transaction.paymentProviderId;
      await app.providers.services.realex.verifyPaymentStatusUpdate(
        request.query,
        providerId,
      );

      const transactionStatus =
        app.providers.services.realex.getTransactionStatus(
          result as RealexStatusEnum,
        );
      await app.transactions.updateTransactionStatus(
        transaction.transactionId.toString(),
        transactionStatus,
      );

      reply.send();
    },
  );
}
