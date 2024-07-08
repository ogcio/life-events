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

import { S3ClientConfig } from "./s3Client.ts";

import NodeClam from "clamscan";

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
    avClient: NodeClam;
    s3Client: S3ClientConfig;
    config: { [key: string]: string | number };
  }
}
