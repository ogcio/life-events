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
import { authPermissions } from "../../types/authPermissions";

const TAGS_CITIZEN = ["Citizen"];
const TAGS_TRANSACTION = ["Transactions"];

export default async function citizen(app: FastifyInstance) {
  app.get<{
    Reply: GenericResponseType<CitizenTransactionDO[]> | Error;
    Querystring: PaginationParamsType;
  }>(
    "/transactions",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [authPermissions.TRANSACTION_SELF_READ]),
      schema: {
        tags: TAGS_CITIZEN,
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
      const userId = request.userData?.userId;
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
        app.checkPermissions(req, res, [authPermissions.TRANSACTION_SELF_READ]),
      schema: {
        tags: TAGS_TRANSACTION,
        response: {
          200: GenericResponse(TransactionDetails),
          404: HttpError,
        },
      },
    },
    async (request, reply) => {
      const { transactionId } = request.params;
      const userId = request.userData?.userId;

      const transactionDetails = await app.transactions.getTransactionById(
        transactionId,
        userId,
      );

      reply.send(formatAPIResponse(transactionDetails));
    },
  );
}
