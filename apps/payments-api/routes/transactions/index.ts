import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import {
  CreateTransactionBody,
  ParamsWithTransactionId,
  PaymentIntentId,
  RealexData,
  RealexHppResponse,
  RealexPaymentObject,
  RealexPaymentObjectQueryParams,
  TransactionDetails,
  Transactions,
  TransactionStatusesEnum,
  UpdateTransactionBody,
} from "../schemas";
import { Type } from "@sinclair/typebox";
import { providerSecretsHandlersFactory } from "../../services/providersSecretsService";
import { RealexService } from "../../services/realexService";

export default async function transactions(app: FastifyInstance) {
  app.get<{
    Reply: TransactionDetails | Error;
    Params: ParamsWithTransactionId;
  }>(
    "/:transactionId",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Transactions"],
        response: {
          200: TransactionDetails,
          404: HttpError,
        },
      },
    },
    async (request, reply) => {
      const { transactionId } = request.params;

      let result;
      try {
        result = await app.pg.query(
          `SELECT
            t.transaction_id as "transactionId",
            t.status,
            t.user_id as "userId",
            t.user_data as "userData",
            pr.title,
            pr.payment_request_id as "paymentRequestId",
            t.ext_payment_id as "extPaymentId",
            t.amount,
            t.updated_at as "updatedAt",
            pp.provider_name as "providerName",
            pp.provider_type as "providerType"
          FROM payment_transactions t
          LEFT JOIN payment_requests pr ON pr.payment_request_id = t.payment_request_id
          JOIN payment_providers pp ON t.payment_provider_id = pp.provider_id
          WHERE t.transaction_id = $1`,
          [transactionId],
        );
      } catch (err) {
        app.log.error((err as Error).message);
      }

      if (!result?.rowCount) {
        throw app.httpErrors.notFound(
          "The requested transaction was not found",
        );
      }

      reply.send(result.rows[0]);
    },
  );

  app.get<{
    Reply: Transactions | Error;
  }>(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Transactions"],
        response: {
          200: Transactions,
          404: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;

      let result;
      try {
        result = await app.pg.query(
          `SELECT
            t.transaction_id as "transactionId",
            t.status,
            t.user_id as "userId",
            t.user_data as "userData",
            pr.title,
            pr.payment_request_id as "paymentRequestId",
            t.ext_payment_id as "extPaymentId",
            t.amount,
            t.updated_at as "updatedAt",
            pp.provider_name as "providerName",
            pp.provider_type as "providerType"
          FROM payment_transactions t
          INNER JOIN payment_requests pr ON pr.payment_request_id = t.payment_request_id AND pr.user_id = $1
          INNER JOIN payment_transactions pt ON pt.transaction_id = t.transaction_id
          JOIN payment_providers pp ON t.payment_provider_id = pp.provider_id`,
          [userId],
        );
      } catch (err) {
        app.log.error((err as Error).message);
      }
      reply.send(result?.rows);
    },
  );

  app.patch<{
    Body: UpdateTransactionBody;
    Reply: {};
    Params: ParamsWithTransactionId;
  }>(
    "/:transactionId",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Transactions"],
        body: UpdateTransactionBody,
        response: {
          200: Type.Object({}),
        },
      },
    },
    async (request, reply) => {
      const { transactionId } = request.params;
      const { status } = request.body;

      await app.pg.query(
        `
        UPDATE payment_transactions
        SET status = $2, updated_at = now()
        WHERE transaction_id = $1
        `,
        [transactionId, status],
      );

      reply.send();
    },
  );

  app.post<{
    Body: CreateTransactionBody;
    Reply: { transactionId: string } | Error;
  }>(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Transactions"],
        body: CreateTransactionBody,
        response: {
          200: Type.Object({
            transactionId: Type.String(),
          }),
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;
      const {
        paymentRequestId,
        extPaymentId,
        integrationReference,
        amount,
        paymentProviderId,
        userData,
      } = request.body;

      const result = await app.pg.query(
        `
        INSERT INTO payment_transactions
          (payment_request_id, ext_payment_id, integration_reference, amount, status, created_at, updated_at, payment_provider_id, user_id, user_data)
          VALUES ($1, $2, $3, $4, $5, now(), now(), $6, $7, $8)
          RETURNING transaction_id as "transactionId";
        `,
        [
          paymentRequestId,
          extPaymentId,
          integrationReference,
          amount,
          TransactionStatusesEnum.Initiated,
          paymentProviderId,
          userId,
          userData,
        ],
      );

      if (result.rowCount !== 1) {
        throw app.httpErrors.internalServerError(
          "Cannot create payment transactions",
        );
      }

      reply.send({ transactionId: result.rows[0].transactionId });
    },
  );

  app.get<{
    Reply: PaymentIntentId | Error;
  }>(
    "/generatePaymentIntentId",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Transactions"],
        response: {
          200: PaymentIntentId,
          400: HttpError,
        },
      },
    },
    async (request, reply) => {
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
          throw app.httpErrors.notFound("Unique intentId generation failed");
        }

        result = await app.pg.query(
          `SELECT "intentId" FROM UPPER(LEFT(md5(random()::text), $1)) AS "intentId"
              WHERE "intentId" NOT IN (
                SELECT ext_payment_id 
                FROM payment_transactions
              )`,
          [len],
        );

        execNr++;
      } while (result.rowCount === 0);

      reply.send(result.rows[0]);
    },
  );

  app.get<{
    Reply: RealexPaymentObject | Error;
    Querystring: RealexPaymentObjectQueryParams;
  }>(
    "/realex/paymentObject",
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

      let providerRes;
      try {
        providerRes = await app.pg.query(
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
      } catch (err) {
        app.log.error((err as Error).message);
      }

      if (!providerRes?.rows.length)
        throw app.httpErrors.notFound("Provider not found");

      const provider = providerRes.rows[0];
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

  // endpoint called by Realex upon payment completion
  app.post<{
    Body: RealexHppResponse;
    Reply: string | Error;
  }>(
    "/realex/verifyPaymentResponse",
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

      let transaction;
      try {
        transaction = await app.pg.query(
          `SELECT * 
          FROM payment_transactions 
          WHERE ext_payment_id = $1`,
          [body.ORDER_ID],
        );
      } catch (err) {
        app.log.error((err as Error).message);
      }

      if (!transaction?.rowCount) {
        throw app.httpErrors.notFound("Transaction not found");
      }

      const providerId = transaction.rows[0].payment_provider_id;
      let providerRes;
      try {
        providerRes = await app.pg.query(
          `
          SELECT
            provider_data as data,
            status
          FROM payment_providers
          WHERE provider_id = $1
          `,
          [providerId],
        );
      } catch (err) {
        app.log.error((err as Error).message);
      }

      if (!providerRes?.rows.length)
        throw app.httpErrors.notFound("Provider not found");

      const provider = providerRes.rows[0];
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
