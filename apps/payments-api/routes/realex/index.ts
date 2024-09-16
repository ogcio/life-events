import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import {
  RealexPaymentObject,
  RealexPaymentObjectQueryParams,
} from "../schemas";
import { Type } from "@sinclair/typebox";
import { authPermissions } from "../../types/authPermissions";
import {
  RealexHppResponseDO,
  RealexPaymentObjectDO,
} from "../../plugins/entities/providers/types";

const TAGS = ["Transactions"];

export default async function realex(app: FastifyInstance) {
  app.get<{
    Reply: RealexPaymentObjectDO | Error;
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
          200: RealexPaymentObject,
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
      reply.send(result);
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

      reply.header("Content-Type", "text/html");
      reply.send(result);
    },
  );
}
