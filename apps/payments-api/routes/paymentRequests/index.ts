import { FastifyInstance } from "fastify";
import { Static, Type } from "@sinclair/typebox";

const ProviderDetails = Type.Object({
  user_id: Type.String(),
  id: Type.String(),
  name: Type.String(),
  type: Type.Union([
    Type.Literal("banktransfer"),
    Type.Literal("openbanking"),
    Type.Literal("stripe"),
  ]),
  status: Type.Union([Type.Literal("connected"), Type.Literal("disconnected")]),
  data: Type.Any(),
  created_at: Type.String(),
});

const PaymentRequest = Type.Object({
  payment_request_id: Type.String(),
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
    redirect_url: Type.String(),
    allowAmountOverride: Type.Boolean(),
    allowCustomAmount: Type.Boolean(),
  }),
]);
type PaymentRequestDetails = Static<typeof PaymentRequestDetails>;

const ParamsWithPaymentRequestId = Type.Object({
  requestId: Type.String(),
});
type ParamsWithPaymentRequestId = Static<typeof ParamsWithPaymentRequestId>;

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
              payment_request_id: Type.String(),
              title: Type.String(),
              description: Type.String(),
              amount: Type.Number(),
              reference: Type.String(),
              providers: Type.Array(
                Type.Object({
                  user_id: Type.String(),
                  id: Type.String(),
                  name: Type.String(),
                  type: Type.String(),
                  status: Type.String(),
                  data: Type.Any(),
                  created_at: Type.String(),
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
        `select pr.title, pr.payment_request_id, pr.description, pr.amount, pr.reference,
                json_agg(json_build_object(
                    'user_id', pp.user_id,
                    'id', pp.provider_id,
                    'name', pp.provider_name,
                    'type', pp.provider_type,
                    'status', pp.status,
                    'data', pp.provider_data,
                    'created_at', pp.created_at
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

  app.get<{ Reply: PaymentRequestDetails; Params: ParamsWithPaymentRequestId }>(
    "/:requestId",
    {
      preValidation: app.verifyUser,
      schema: {
        tags: ["PaymentRequests"],
        response: {
          200: Type.Object({
            payment_request_id: Type.String(),
            title: Type.String(),
            description: Type.String(),
            amount: Type.Number(),
            reference: Type.String(),
            providers: Type.Array(
              Type.Object({
                user_id: Type.String(),
                id: Type.String(),
                name: Type.String(),
                type: Type.String(),
                status: Type.String(),
                data: Type.Any(),
                created_at: Type.String(),
              }),
            ),
            redirect_url: Type.String(),
            allowAmountOverride: Type.Boolean(),
            allowCustomAmount: Type.Boolean(),
          }),
        },
      },
    },
    async (request, reply) => {
      const userId = request.user?.id;
      const { requestId } = request.params;

      const result = await app.pg.query(
        `SELECT pr.title,
            pr.payment_request_id,
            pr.description,
            pr.amount,
            json_agg(json_build_object(
              'user_id', pp.user_id,
              'id', pp.provider_id,
              'name', pp.provider_name,
              'type', pp.provider_type,
              'status', pp.status,
              'data', pp.provider_data,
              'created_at', pp.created_at
            )) as providers,
            pr.reference,
            pr.redirect_url,
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

      reply.send(result.rows[0]);
    },
  );
}
