import { FastifyInstance } from "fastify";
import { Static, Type } from "@sinclair/typebox";
import { httpErrors } from "@fastify/sensible";
import { HttpError } from "../../types/httpErrors";

const ProviderDetails = Type.Object({
  userId: Type.String(),
  id: Type.String(),
  name: Type.String(),
  type: Type.Union([
    Type.Literal("banktransfer"),
    Type.Literal("openbanking"),
    Type.Literal("stripe"),
  ]),
  status: Type.Union([Type.Literal("connected"), Type.Literal("disconnected")]),
  data: Type.Any(),
  createdAt: Type.String(),
});

const PaymentRequest = Type.Object({
  paymentRequestId: Type.String(),
  title: Type.String(),
  description: Type.String(),
  amount: Type.Number(),
  reference: Type.String(),
  providers: Type.Array(ProviderDetails),
});
type PaymentRequest = Static<typeof PaymentRequest>;

const PaymentRequestDetails = Type.Composite([
  PaymentRequest,
  Type.Object({
    redirectUrl: Type.String(),
    allowAmountOverride: Type.Boolean(),
    allowCustomAmount: Type.Boolean(),
  }),
]);
type PaymentRequestDetails = Static<typeof PaymentRequestDetails>;

const ParamsWithPaymentRequestId = Type.Object({
  requestId: Type.String(),
});
type ParamsWithPaymentRequestId = Static<typeof ParamsWithPaymentRequestId>;

const CreatePaymentRequest = Type.Object({
  title: Type.String(),
  description: Type.String(),
  reference: Type.String(),
  amount: Type.Number(),
  redirectUrl: Type.String(),
  allowAmountOverride: Type.Boolean(),
  allowCustomAmount: Type.Boolean(),
  accounts: Type.Array(
    Type.Object({
      account: Type.String(),
      enabled: Type.Boolean(),
    }),
  ),
});
type CreatePaymentRequest = Static<typeof CreatePaymentRequest>;

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
              providers: Type.Array(
                Type.Object({
                  userId: Type.String(),
                  id: Type.String(),
                  name: Type.String(),
                  type: Type.String(),
                  status: Type.String(),
                  data: Type.Any(),
                  createdAt: Type.String(),
                }),
              ),
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
          json_agg(json_build_object(
              'userId', pp.user_id,
              'id', pp.provider_id,
              'name', pp.provider_name,
              'type', pp.provider_type,
              'status', pp.status,
              'data', pp.provider_data,
              'createdAt', pp.created_at
          )) as providers
        from payment_requests pr
        join payment_requests_providers ppr on pr.payment_request_id = ppr.payment_request_id
        join payment_providers pp on ppr.provider_id = pp.provider_id
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
                status: Type.String(),
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
      const userId = request.user?.id;
      const { requestId } = request.params;

      const result = await app.pg.query(
        `SELECT pr.title,
            pr.payment_request_id as "paymentRequestId",
            pr.description,
            pr.amount,
            json_agg(json_build_object(
              'userId', pp.user_id,
              'id', pp.provider_id,
              'name', pp.provider_name,
              'type', pp.provider_type,
              'status', pp.status,
              'data', pp.provider_data,
              'createdAt', pp.created_at
            )) as providers,
            pr.reference,
            pr.redirect_url as "redirectUrl",
            pr.allow_amount_override AS "allowAmountOverride",
            pr.allow_custom_amount AS "allowCustomAmount"
        FROM payment_requests pr
        JOIN payment_requests_providers ppr ON pr.payment_request_id = ppr.payment_request_id AND ppr.enabled = true
        JOIN payment_providers pp ON ppr.provider_id = pp.provider_id
        WHERE pr.payment_request_id = $1
          AND pr.user_id = $2
        GROUP BY pr.payment_request_id`,
        [requestId, userId],
      );

      if (!result.rowCount) {
        reply.send(
          httpErrors.notFound("The requested payment request was not found"),
        );
        return;
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
        accounts,
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

          const accountsData = [paymentRequestId].concat(
            accounts.flatMap((acc) => [acc.account, acc.enabled]),
          );

          const queryValues = accounts
            .map((acc, index) => {
              const paramPosition = 2 * (index + 1);
              return `($${paramPosition}, $1 , $${paramPosition + 1})`;
            })
            .join(",");

          const paymentRequestProviderQueryResult = await client.query(
            `insert into payment_requests_providers (provider_id, payment_request_id, enabled)
            values ${queryValues} RETURNING payment_request_id`,
            accountsData,
          );

          if (paymentRequestProviderQueryResult.rowCount !== accounts.length) {
            // handle creation failure
            throw new Error("Failed to create payment");
          }

          return paymentRequestId;
        });

        reply.send({ id: result });
      } catch (error) {
        reply.send(httpErrors.internalServerError((error as Error).message));
      }
    },
  );
}
