import { FastifyInstance } from "fastify";
import { Type } from "@sinclair/typebox";
import { HttpError } from "../../types/httpErrors";
import {
  CreatePaymentRequest,
  EditPaymentRequest,
  ParamsWithPaymentRequestId,
  PaymentRequest,
  PaymentRequestDetails,
  ProviderDetails,
  ProviderStatus,
  Transaction,
} from "../schemas";

export default async function paymentRequests(app: FastifyInstance) {
  app.get<{ Reply: PaymentRequest[] }>(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["PaymentRequests"],
        response: {
          200: Type.Array(
            Type.Object({
              paymentRequestId: Type.String(),
              title: Type.String(),
              description: Type.String(),
              amount: Type.Number(),
              reference: Type.String(),
              providers: Type.Array(ProviderDetails),
            }),
          ),
        },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;

      const result = await app.pg.query(
        `select pr.title,
          pr.payment_request_id as "paymentRequestId",
          pr.description,
          pr.amount,
          pr.reference,
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
        from payment_requests pr
        left join payment_requests_providers ppr on pr.payment_request_id = ppr.payment_request_id
        left join payment_providers pp on ppr.provider_id = pp.provider_id
        where pr.user_id = $1
        group by pr.payment_request_id`,
        [userId],
      );

      reply.send(result.rows);
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
          200: Type.Object({
            paymentRequestId: Type.String(),
            title: Type.String(),
            description: Type.String(),
            amount: Type.Number(),
            reference: Type.String(),
            providers: Type.Array(ProviderDetails),
            redirectUrl: Type.String(),
            allowAmountOverride: Type.Boolean(),
            allowCustomAmount: Type.Boolean(),
          }),
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
          200: Type.Object({
            paymentRequestId: Type.String(),
            title: Type.String(),
            description: Type.String(),
            amount: Type.Number(),
            reference: Type.String(),
            providers: Type.Array(
              Type.Object({
                userId: Type.String(),
                id: Type.String(),
                name: Type.String(),
                type: Type.String(),
                status: ProviderStatus,
                data: Type.Any(),
                createdAt: Type.String(),
              }),
            ),
            redirectUrl: Type.String(),
            allowAmountOverride: Type.Boolean(),
            allowCustomAmount: Type.Boolean(),
          }),
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

  app.post<{ Body: CreatePaymentRequest; Reply: { id: string } | Error }>(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["PaymentRequests"],
        body: CreatePaymentRequest,
        response: {
          200: Type.Object({
            id: Type.String(),
          }),
        },
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
              "pending",
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

  app.put<{ Body: EditPaymentRequest; Reply: { id: string } | Error }>(
    "/",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["PaymentRequests"],
        body: EditPaymentRequest,
        response: {
          200: Type.Object({
            id: Type.String(),
          }),
        },
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
      } = request.body;

      try {
        await app.pg.transact(async (client) => {
          await client.query(
            `update payment_requests 
              set title = $1, description = $2, reference = $3, amount = $4, redirect_url = $5, allow_amount_override = $6, allow_custom_amount = $7 
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
            ],
          );

          if (providersUpdate.toDisable.length) {
            const idsToDisable = providersUpdate.toDisable.join(", ");

            await app.pg.query(
              `update payment_requests_providers set enabled = false
                where payment_request_id = $1 and provider_id in ($2)`,
              [paymentRequestId, idsToDisable],
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

  app.get<{ Reply: Transaction[]; Params: ParamsWithPaymentRequestId }>(
    "/:requestId/transactions",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["Transactions"],
        response: {
          200: Type.Array(Transaction),
        },
      },
    },
    async (request, reply) => {
      const { requestId } = request.params;

      let result;
      try {
        result = await app.pg.query(
          `SELECT
            t.transaction_id as "transactionId",
            t.status,
            pr.title,
            pt.amount,
            t.updated_at as "updatedAt"
          FROM payment_transactions t
          INNER JOIN payment_requests pr ON pr.payment_request_id = t.payment_request_id
          INNER JOIN payment_transactions pt ON pt.transaction_id = t.transaction_id
          WHERE pr.payment_request_id = $1
          ORDER BY t.updated_at DESC`,
          [requestId],
        );
      } catch (err) {
        app.log.error((err as Error).message);
        throw app.httpErrors.notFound(
          "Transactions not found for the requested payment request",
        );
      }

      reply.send(result.rows);
    },
  );
}
