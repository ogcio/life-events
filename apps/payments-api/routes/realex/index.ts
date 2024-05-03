import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import {
  RealexData,
  RealexHppResponse,
  RealexPaymentObject,
  RealexPaymentObjectQueryParams,
} from "../schemas";
import { Type } from "@sinclair/typebox";
import { providerSecretsHandlersFactory } from "../../services/providersSecretsService";
import { RealexService } from "../../services/realexService";

export default async function realex(app: FastifyInstance) {
  app.get<{
    Reply: RealexPaymentObject | Error;
    Querystring: RealexPaymentObjectQueryParams;
  }>(
    "/paymentObject",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Transactions"],
        querystring: RealexPaymentObjectQueryParams,
        response: {
          200: RealexPaymentObject,
          404: HttpError,
          422: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;
      const { providerId, amount, intentId } = request.query;

      const providerRes = await app.pg.query(
        `
          SELECT
            provider_data as data,
            status
          FROM payment_providers
          WHERE provider_id = $1
          AND user_id = $2
          `,
        [providerId, userId],
      );

      const provider = providerRes.rows[0];
      if (!provider) throw app.httpErrors.notFound("Provider not found");

      if (provider.status !== "connected") {
        throw app.httpErrors.unprocessableEntity("Provider is not enabled");
      }

      const providerSecretsHandler = providerSecretsHandlersFactory("realex");
      const { merchantId, sharedSecret } =
        providerSecretsHandler.getClearTextData(
          provider.data,
        ) as unknown as RealexData;

      const currency = "EUR";
      const url =
        process.env.REALEX_PAYMENT_URL ??
        "https://pay.sandbox.realexpayments.com/pay";
      const realexService = new RealexService(sharedSecret);
      const timestamp = realexService.generateTimestamp();
      const hash = realexService.generateHash(
        [timestamp, merchantId, intentId, amount, currency].join("."),
      );

      const result = {
        ACCOUNT: process.env.REALEX_PAYMENT_ACCOUNT ?? "internet",
        AMOUNT: amount,
        CURRENCY: currency,
        MERCHANT_ID: merchantId,
        ORDER_ID: intentId,
        TIMESTAMP: timestamp,
        URL: url,
        SHA256HASH: hash,
      };

      reply.send(result);
    },
  );

  // endpoint called by Realex upon payment completion.
  // The HTML response received will be rendered by HPP. The redirect is on us
  app.post<{
    Body: RealexHppResponse;
    Reply: string | Error;
  }>(
    "/verifyPaymentResponse",
    {
      schema: {
        tags: ["Transactions"],
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

      const transaction = await app.pg.query(
        `SELECT * 
          FROM payment_transactions 
          WHERE ext_payment_id = $1`,
        [body.ORDER_ID],
      );

      if (!transaction?.rowCount)
        throw app.httpErrors.notFound("Transaction not found");

      const providerId = transaction.rows[0].payment_provider_id;
      const providerRes = await app.pg.query(
        `
          SELECT
            provider_data as data,
            status
          FROM payment_providers
          WHERE provider_id = $1
          `,
        [providerId],
      );

      const provider = providerRes.rows[0];
      if (!provider) throw app.httpErrors.notFound("Provider not found");

      if (provider.status !== "connected") {
        throw app.httpErrors.unprocessableEntity("Provider is not enabled");
      }

      const providerSecretsHandler = providerSecretsHandlersFactory("realex");
      const { sharedSecret } = providerSecretsHandler.getClearTextData(
        provider.data,
      ) as unknown as RealexData;

      const realexService = new RealexService(sharedSecret);
      const isResponseValid = realexService.verifyHash(body);
      if (!isResponseValid) {
        throw app.httpErrors.unprocessableEntity(
          "Payment response contains untrusted data",
        );
      }

      const res = realexService.generateHTMLResponse(body);

      reply.header("Content-Type", "text/html");
      reply.send(res);
    },
  );
}
