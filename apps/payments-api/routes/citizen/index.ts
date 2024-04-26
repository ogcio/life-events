import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import {
  CitizenTransactions,
  ParamsWithTransactionId,
  TransactionDetails,
} from "../schemas";

export default async function citizen(app: FastifyInstance) {
  app.get<{
    Reply: CitizenTransactions | Error;
  }>(
    "/transactions",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Citizen"],
        response: {
          200: CitizenTransactions,
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
            pr.title,
            t.amount,
            t.updated_at as "updatedAt"
          FROM payment_transactions t
          INNER JOIN payment_requests pr ON pr.payment_request_id = t.payment_request_id
          WHERE t.user_id = $1`,
          [userId],
        );
      } catch (err) {
        app.log.error((err as Error).message);
      }
      reply.send(result?.rows);
    },
  );

  app.get<{
    Reply: TransactionDetails | Error;
    Params: ParamsWithTransactionId;
  }>(
    "/transactions/:transactionId",
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
          LEFT JOIN payment_requests pr ON pr.payment_request_id = t.payment_request_id
          JOIN payment_providers pp ON t.payment_provider_id = pp.provider_id
          WHERE t.transaction_id = $1
            AND t.user_id = $2`,
          [transactionId, userId],
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
}
