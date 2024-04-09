import { FastifyInstance } from "fastify";
import { httpErrors } from "@fastify/sensible";
import { HttpError } from "../../types/httpErrors";
import {
  CreateTransactionBody,
  ParamsWithTransactionId,
  TransactionDetails,
  UpdateTransactionBody,
} from "../../types/schemaDefinitions";
import { Type } from "@sinclair/typebox";

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

      const result = await app.pg.query(
        `SELECT
          t.transaction_id as "transactionId",
          t.status,
          t.user_data as "userData",
          pr.title,
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

      if (!result.rowCount) {
        reply.send(
          httpErrors.notFound("The requested transaction was not found"),
        );
        return;
      }

      reply.send(result.rows[0]);
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
        insert into payment_transactions
          (payment_request_id, ext_payment_id, integration_reference, amount, status, created_at, updated_at, payment_provider_id, user_data)
          values ($1, $2, $3, $4, 'pending', now(), now(), $5, $6)
          returning transaction_id as "transactionId";
        `,
        [
          paymentRequestId,
          extPaymentId,
          integrationReference,
          amount,
          paymentProviderId,
          userData,
        ],
      );

      if (result.rowCount !== 1) {
        reply.send(
          httpErrors.internalServerError("Cannot create payment transactions"),
        );
        return;
      }

      reply.send({ transactionId: result.rows[0].transactionId });
    },
  );
}
