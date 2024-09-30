import { FastifyInstance } from "fastify";
import { HttpError } from "../../types/httpErrors";
import Stripe from "stripe";
import { AuditLogEventType } from "../../plugins/auditLog/auditLogEvents";
import {
  getTransactionStatusFromStripeEventType,
  removeEmptyProps,
} from "./utils";

const TAGS = ["Stripe"];

export default async function stripe(app: FastifyInstance) {
  app.post(
    "/webhook",
    {
      config: {
        rawBody: true,
      },
      schema: {
        tags: TAGS,
        response: {
          404: HttpError,
        },
      },
    },
    async (request, reply) => {
      const sig = request.headers["stripe-signature"] as string;
      const body: Stripe.Event = JSON.parse(request.rawBody as string);
      const extId = (body.data.object as any).id;

      let transaction;
      try {
        transaction = await app.transactions.getTransactionByExtId(extId);
      } catch (err) {
        throw app.httpErrors.notFound("Transaction not found!");
      }

      let organization;
      try {
        organization =
          await app.paymentRequest.getOrganizationIdFromPaymentRequest(
            transaction.paymentRequestId,
          );
      } catch (err) {
        throw app.httpErrors.notFound("Payment request not found!");
      }

      let provider;
      try {
        provider = await app.providers.getProviderById(
          transaction.paymentProviderId,
        );
      } catch (err) {
        throw app.httpErrors.notFound("Provider not found!");
      }

      /**
       * For testing purposes we are falling back to stored secrets
       *
       *  const stripeSecret = (provider.data as StripeData).liveSecretKey;
       *  const endpointSecret = (provider.data as StripeData).endpointSecret; // Has to be implemented
       */

      // Temporary solution!
      const stripeSecret = process.env.STRIPE_SECRET_KEY;
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      const instance = new Stripe(stripeSecret!);

      let event: Stripe.Event;

      try {
        event = instance.webhooks.constructEvent(
          request.rawBody as string,
          sig,
          endpointSecret!,
        );
      } catch (err) {
        throw app.httpErrors.getHttpError(
          400,
          `Webhook Error: ${(err as Error).message}`,
        );
      }

      const transactionStatus = getTransactionStatusFromStripeEventType(event);

      if (!transactionStatus) {
        reply.send();
        return;
      }

      await app.transactions.updateTransactionStatus(
        transaction.transactionId,
        transactionStatus,
      );

      app.auditLog.createEvent({
        eventType: AuditLogEventType.TRANSACTION_STATUS_UPDATE,
        userId: transaction.userId,
        organizationId: organization.organizationId,
        metadata: {
          resource: {
            type: "transaction",
            id: extId,
          },
          stripeEvent: removeEmptyProps(event),
        },
      });

      reply.send();
    },
  );
}
