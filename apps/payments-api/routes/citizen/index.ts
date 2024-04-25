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
}
