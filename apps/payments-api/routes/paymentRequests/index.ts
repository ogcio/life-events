import { FastifyInstance } from "fastify";
import { Type } from "@sinclair/typebox";
import { HttpError } from "../../types/httpErrors";
import {
  CreatePaymentRequest,
  EditPaymentRequest,
  GenericResponse,
  Id,
  PaginationParams,
  ParamsWithPaymentRequestId,
  PaymentRequest,
  PaymentRequestDetails,
  Transaction,
} from "../schemas";
import {
  PAGINATION_LIMIT_DEFAULT,
  PAGINATION_OFFSET_DEFAULT,
  PaginationDetails,
} from "../../utils/pagination";
import { formatAPIResponse } from "../../utils/responseFormatter";
import { PaginationParams as PaginationParamsType } from "../../types/pagination";
import { GenericResponse as GenericResponseType } from "../../types/genericResponse";
import { TransactionDO } from "../../plugins/entities/transactions/types";

export default async function paymentRequests(app: FastifyInstance) {
  app.get<{
    Reply: GenericResponseType<PaymentRequest[]>;
    Querystring: PaginationParamsType;
  }>(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["PaymentRequests"],
        querystring: PaginationParams,
        response: { 200: GenericResponse(Type.Array(PaymentRequest)) },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;
      const {
        offset = PAGINATION_OFFSET_DEFAULT,
        limit = PAGINATION_LIMIT_DEFAULT,
      } = request.query;

      let result;
      let totalCountResult;
      try {
        const from = `from payment_requests pr`;
        const conditions = `where pr.user_id = $1`;
        result = await app.pg.query(
          `select pr.title,
            pr.payment_request_id as "paymentRequestId",
            pr.description,
            pr.amount,
            pr.reference,
            pr.status,
            CASE 
                WHEN COUNT(pp.provider_id) > 0 THEN json_agg(json_build_object(
                    'userId', pp.user_id,
                    'id', pp.provider_id,
                    'name', pp.provider_name,
                    'type', pp.provider_type,
                    'status', pp.status,
                    'data', pp.provider_data,
                    'createdAt', pp.created_at
                ))
              ELSE '[]'::json
              END as providers
          ${from}
          left join payment_requests_providers ppr on pr.payment_request_id = ppr.payment_request_id 
          left join payment_providers pp on ppr.provider_id = pp.provider_id
          ${conditions}
          group by pr.payment_request_id
          ORDER BY pr.created_at DESC
          LIMIT $2 OFFSET $3`,
          [userId, limit, offset],
        );

        totalCountResult = await app.pg.query(
          `select 
            count(*) as "totalCount"
          ${from}
          ${conditions}`,
          [userId],
        );
      } catch (err) {
        app.log.error((err as Error).message);
      }

      const totalCount = totalCountResult?.rows[0].totalCount;
      const data = result?.rows ?? [];
      const url = request.url.split("?")[0];

      const paginationDetails: PaginationDetails = {
        offset,
        limit,
        totalCount,
        url: url,
      };

      reply.send(formatAPIResponse(data, paginationDetails));
    },
  );

  app.get<{
    Reply: PaymentRequestDetails | Error;
    Params: ParamsWithPaymentRequestId;
  }>(
    "/:requestId",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["PaymentRequests"],
        params: ParamsWithPaymentRequestId,
        response: {
          200: PaymentRequestDetails,
          404: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;
      const { requestId } = request.params;

      let result;
      try {
        result = await app.pg.query(
          `SELECT pr.title,
              pr.payment_request_id as "paymentRequestId",
              pr.description,
              pr.amount,
              pr.status,
              CASE 
                WHEN COUNT(pp.provider_id) > 0 THEN json_agg(json_build_object(
                    'userId', pp.user_id,
                    'id', pp.provider_id,
                    'name', pp.provider_name,
                    'type', pp.provider_type,
                    'status', pp.status,
                    'data', pp.provider_data,
                    'createdAt', pp.created_at
                ))
              ELSE '[]'::json
              END as providers,
              pr.reference,
              pr.redirect_url as "redirectUrl",
              pr.allow_amount_override AS "allowAmountOverride",
              pr.allow_custom_amount AS "allowCustomAmount"
          FROM payment_requests pr
          LEFT JOIN payment_requests_providers ppr ON pr.payment_request_id = ppr.payment_request_id AND ppr.enabled = true
          LEFT JOIN payment_providers pp ON ppr.provider_id = pp.provider_id
          WHERE pr.payment_request_id = $1
            AND pr.user_id = $2
          GROUP BY pr.payment_request_id`,
          [requestId, userId],
        );
      } catch (err) {
        app.log.error((err as Error).message);
      }

      if (!result?.rowCount) {
        throw app.httpErrors.notFound(
          "The requested payment request was not found",
        );
      }

      reply.send(result.rows[0]);
    },
  );

  app.get<{
    Reply: PaymentRequestDetails | Error;
    Params: ParamsWithPaymentRequestId;
  }>(
    "/:requestId/public-info",
    {
      schema: {
        tags: ["PaymentRequests"],
        params: ParamsWithPaymentRequestId,
        response: {
          200: PaymentRequestDetails,
          404: HttpError,
        },
      },
    },
    async (request, reply) => {
      const { requestId } = request.params;

      let result;
      try {
        result = await app.pg.query(
          `SELECT pr.title,
              pr.payment_request_id as "paymentRequestId",
              pr.description,
              pr.amount,
              pr.status,
              CASE 
                WHEN COUNT(pp.provider_id) > 0 THEN json_agg(json_build_object(
                    'userId', pp.user_id,
                    'id', pp.provider_id,
                    'name', pp.provider_name,
                    'type', pp.provider_type,
                    'status', pp.status,
                    'data', pp.provider_data,
                    'createdAt', pp.created_at
                ))
              ELSE '[]'::json
              END as providers,
              pr.reference,
              pr.redirect_url as "redirectUrl",
              pr.allow_amount_override AS "allowAmountOverride",
              pr.allow_custom_amount AS "allowCustomAmount"
          FROM payment_requests pr
          LEFT JOIN payment_requests_providers ppr ON pr.payment_request_id = ppr.payment_request_id AND ppr.enabled = true
          LEFT JOIN payment_providers pp ON ppr.provider_id = pp.provider_id
          WHERE pr.payment_request_id = $1
          GROUP BY pr.payment_request_id`,
          [requestId],
        );
      } catch (err) {
        app.log.error((err as Error).message);
      }

      if (!result?.rowCount) {
        throw app.httpErrors.notFound(
          "The requested payment request was not found",
        );
      }

      reply.send(result.rows[0]);
    },
  );

  app.post<{ Body: CreatePaymentRequest; Reply: Id | Error }>(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["PaymentRequests"],
        body: CreatePaymentRequest,
        response: { 200: Id },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;
      const {
        title,
        description,
        reference,
        amount,
        redirectUrl,
        allowAmountOverride,
        allowCustomAmount,
        providers,
        status,
      } = request.body;

      try {
        const result = await app.pg.transact(async (client) => {
          const paymentRequestQueryResult = await client.query(
            `insert into payment_requests (user_id, title, description, reference, amount, redirect_url, status, allow_amount_override, allow_custom_amount)
              values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
              returning payment_request_id`,
            [
              userId,
              title,
              description,
              reference,
              amount,
              redirectUrl,
              status,
              allowAmountOverride,
              allowCustomAmount,
            ],
          );

          if (!paymentRequestQueryResult.rowCount) {
            // handle creation failure
            throw new Error("Failed to create payment");
          }

          const paymentRequestId =
            paymentRequestQueryResult.rows[0].payment_request_id;

          const sqlData = [paymentRequestId, ...providers];

          if (!providers.length) {
            return paymentRequestId;
          }

          const queryValues = providers
            .map((_, index) => {
              return `($${index + 2}, $1, true)`;
            })
            .join(",");

          const paymentRequestProviderQueryResult = await client.query(
            `insert into payment_requests_providers (provider_id, payment_request_id, enabled)
            values ${queryValues} RETURNING payment_request_id`,
            sqlData,
          );

          if (paymentRequestProviderQueryResult.rowCount !== providers.length) {
            // handle creation failure
            throw new Error("Failed to create payment");
          }

          return paymentRequestId;
        });

        reply.send({ id: result });
      } catch (error) {
        throw app.httpErrors.internalServerError((error as Error).message);
      }
    },
  );

  app.put<{ Body: EditPaymentRequest; Reply: Id | Error }>(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["PaymentRequests"],
        body: EditPaymentRequest,
        response: { 200: Id },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;
      const {
        title,
        description,
        reference,
        amount,
        redirectUrl,
        allowAmountOverride,
        allowCustomAmount,
        paymentRequestId,
        providersUpdate,
        status,
      } = request.body;

      try {
        await app.pg.transact(async (client) => {
          await client.query(
            `update payment_requests 
              set title = $1, description = $2, reference = $3, amount = $4, redirect_url = $5, allow_amount_override = $6, allow_custom_amount = $7 , status = $10
              where payment_request_id = $8 and user_id = $9`,
            [
              title,
              description,
              reference,
              amount,
              redirectUrl,
              allowAmountOverride,
              allowCustomAmount,
              paymentRequestId,
              userId,
              status,
            ],
          );

          if (providersUpdate.toDisable.length) {
            await app.pg.query(
              `update payment_requests_providers set enabled = false
                where payment_request_id = $1 and provider_id = any($2::uuid[])`,
              [paymentRequestId, providersUpdate.toDisable],
            );
          }

          if (providersUpdate.toCreate.length) {
            const sqlData = [paymentRequestId, ...providersUpdate.toCreate];
            const queryValues = providersUpdate.toCreate
              .map((_, index) => {
                return `($${index + 2}, $1, true)`;
              })
              .join(",");

            await client.query(
              `INSERT INTO payment_requests_providers (provider_id, payment_request_id, enabled) 
              VALUES ${queryValues}
              ON CONFLICT (provider_id, payment_request_id) 
              DO UPDATE SET enabled = EXCLUDED.enabled`,
              sqlData,
            );
          }
        });

        reply.send({ id: paymentRequestId });
      } catch (error) {
        throw app.httpErrors.internalServerError((error as Error).message);
      }
    },
  );

  app.delete<{
    Reply: {} | Error;
    Params: ParamsWithPaymentRequestId;
  }>(
    "/:requestId",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["PaymentRequests"],
        response: {
          200: Type.Object({}),
          404: HttpError,
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;
      const { requestId } = request.params;

      let transactions;
      try {
        transactions = await app.pg.query(
          `select transaction_id from payment_transactions where payment_request_id = $1`,
          [requestId],
        );
      } catch (err) {
        app.log.error((err as Error).message);
      }

      if (transactions?.rowCount) {
        throw app.httpErrors.internalServerError(
          "Payment request with existing transactions cannot be deleted",
        );
      }

      try {
        await app.pg.transact(async (client) => {
          await client.query(
            `delete from payment_requests_providers
            where payment_request_id = $1`,
            [requestId],
          );

          const deleted = await client.query(
            `delete from payment_requests
            where payment_request_id = $1
              and user_id = $2
            returning payment_request_id`,
            [requestId, userId],
          );

          if (deleted.rowCount === 0) {
            throw app.httpErrors.notFound("Payment request was not found");
          }
        });
      } catch (error) {
        if (error instanceof Error && error.name !== "error") {
          throw error;
        }

        throw app.httpErrors.internalServerError((error as Error).message);
      }

      reply.send();
    },
  );

  app.get<{
    Reply: GenericResponseType<TransactionDO[]>;
    Params: ParamsWithPaymentRequestId;
    Querystring: PaginationParamsType;
  }>(
    "/:requestId/transactions",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Transactions"],
        querystring: PaginationParams,
        response: {
          200: GenericResponse(Type.Array(Transaction)),
        },
      },
    },
    async (request, reply) => {
      const { requestId } = request.params;
      const {
        offset = PAGINATION_OFFSET_DEFAULT,
        limit = PAGINATION_LIMIT_DEFAULT,
      } = request.query;

      let result;
      let totalCountResult;
      try {
        const from = `FROM payment_transactions t`;
        const joins = `INNER JOIN payment_requests pr ON pr.payment_request_id = t.payment_request_id
        INNER JOIN payment_transactions pt ON pt.transaction_id = t.transaction_id`;
        const condition = `WHERE pr.payment_request_id = $1`;
        result = await app.pg.query(
          `SELECT
            t.transaction_id as "transactionId",
            t.status,
            pr.title,
            pt.amount,
            t.updated_at as "updatedAt"
          ${from}
          ${joins}
          ${condition}
          ORDER BY t.updated_at DESC
          LIMIT $2 OFFSET $3`,
          [requestId, limit, offset],
        );

        totalCountResult = await app.pg.query(
          `SELECT
              count(*) as "totalCount"
            ${from}
            ${joins}
            ${condition}`,
          [requestId],
        );
      } catch (err) {
        app.log.error((err as Error).message);
        throw app.httpErrors.notFound(
          "Transactions not found for the requested payment request",
        );
      }

      const totalCount = totalCountResult?.rows[0].totalCount;
      const data = result?.rows ?? [];
      const url = request.url.split("?")[0];

      const paginationDetails: PaginationDetails = {
        offset,
        limit,
        totalCount,
        url: url,
      };

      reply.send(formatAPIResponse(data, paginationDetails));
    },
  );
}
