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
import { TransactionDetailsDO } from "../../plugins/entities/transactions/types";

export default async function citizen(app: FastifyInstance) {
  app.get<{
    Reply: GenericResponseType<CitizenTransactionDO[]> | Error;
    Querystring: PaginationParamsType;
  }>(
    "/transactions",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, ["payments:transaction.self:read"]),
      schema: {
        tags: ["Citizen"],
        querystring: PaginationParams,
        response: {
          200: GenericResponse(CitizenTransactions),
          401: HttpError,
          404: HttpError,
          500: HttpError,
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
    Reply: GenericResponseType<TransactionDetailsDO> | Error;
    Params: ParamsWithTransactionId;
  }>(
    "/transactions/:transactionId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, ["payments:transaction.self:read"]),
      schema: {
        tags: ["Transactions"],
        response: {
          200: GenericResponse(TransactionDetails),
          404: HttpError,
        },
      },
    },
    async (request, reply) => {
      const { transactionId } = request.params;
      const userId = request.user?.id;

      const transactionDetails = await app.transactions.getTransactionById(
        transactionId,
        userId,
      );

      reply.send(formatAPIResponse(transactionDetails));
    },
  );
}
