/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

import {
  FastifyLoggerInstance,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerBase,
  RawServerDefault,
} from "fastify";
import { ProvidersPlugin } from "../plugins/entities/providers";
import { CitizenPlugin } from "../plugins/entities/citizen";
import { TransactionsPlugin } from "../plugins/entities/transactions";
import { PaymentRequestPlugin } from "../plugins/entities/paymentRequest";

declare module "fastify" {
  export interface FastifyInstance<
    RawServer extends RawServerBase = RawServerDefault,
    RawRequest extends
      RawRequestDefaultExpression<RawServer> = RawRequestDefaultExpression<RawServer>,
    RawReply extends
      RawReplyDefaultExpression<RawServer> = RawReplyDefaultExpression<RawServer>,
    Logger = FastifyLoggerInstance,
  > {
    verifyUser: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    verifyUserWithSessionId: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;

    validateIsPublicServant: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;

    checkPermissions: (
      request: FastifyRequest,
      reply: FastifyReply,
      permissions: string[],
      matchConfig?: { method: "AND" | "OR" },
    ) => Promise<void>;

    providers: ProvidersPlugin;
    citizen: CitizenPlugin;
    transactions: TransactionsPlugin;
    paymentRequest: PaymentRequestPlugin;
  }
}
