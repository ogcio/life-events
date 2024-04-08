import { FastifyInstance } from "fastify";
import { httpErrors } from "@fastify/sensible";
import { HttpError } from "../../types/httpErrors";
import {
  ParamsWithTransactionId,
  TransactionDetails,
} from "../../types/schemaDefinitions";

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
}
