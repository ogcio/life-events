import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import {
  CitizenTransactions,
  GenericResponse,
  PaginationParams,
  ParamsWithTransactionId,
  TransactionDetails,
} from "../schemas";
import {
  PAGINATION_LIMIT_DEFAULT,
  PAGINATION_OFFSET_DEFAULT,
  PaginationDetails,
} from "../../utils/pagination";
import { formatAPIResponse } from "../../utils/responseFormatter";
import { CitizenTransactionDO } from "../../plugins/entities/citizen/types";
import { GenericResponse as GenericResponseType } from "../../types/genericResponse";
import { PaginationParams as PaginationParamsType } from "../../types/pagination";

export default async function citizen(app: FastifyInstance) {
  app.get<{
    Reply: GenericResponseType<CitizenTransactionDO[]> | Error;
    Querystring: PaginationParamsType;
  }>(
    "/transactions",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Citizen"],
        querystring: PaginationParams,
        response: {
          200: GenericResponse(CitizenTransactions),
          404: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;
      const {
        offset = PAGINATION_OFFSET_DEFAULT,
        limit = PAGINATION_LIMIT_DEFAULT,
      } = request.query;

      if (!userId) {
        throw app.httpErrors.unauthorized("Unauthorized!");
      }

      const transactions = await app.citizen.getTransactions(userId, {
        offset,
        limit,
      });
      const totalCount = await app.citizen.getTransactionsTotalCount(userId);
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
