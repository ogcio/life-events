import { Static, Type } from "@sinclair/typebox";
import { FastifyInstance } from "fastify";
import {
  BadRequestError,
  isLifeEventsError,
  NotFoundError,
  ServerError,
} from "shared-errors";
import { ensureUserIdIsSet } from "../../utils/authentication-factory.js";
import {
  EventType,
  MessageEventData,
  MessagingEventType,
  newMessagingEventLogger,
} from "../../services/messages/eventLogger.js";
import { PoolClient, QueryResult } from "pg";
import { Permissions } from "../../types/permissions.js";
import { HttpError } from "../../types/httpErrors.js";

export const prefix = "/message-actions";

const MessageActions = Type.Object({
  messageId: Type.String({ format: "uuid" }),
  isSeen: Type.Boolean(),
});

export default async function messagesActions(app: FastifyInstance) {
  app.put<{
    Body: Static<typeof MessageActions>;
    Params: { messageId: string };
  }>(
    "/:messageId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.MessageSelf.Write]),
      schema: {
        tags: ["Message actions"],
        body: MessageActions,
        response: {
          200: Type.Null(),
          "4xx": HttpError,
          "5xx": HttpError,
        },
      },
    },
    async function putMessageOptions(req) {
      const errorProcess = "PUT_MESSAGE_OPTIONS";
      const messageOptionId = req.params.messageId;
      if (messageOptionId !== req.body.messageId) {
        throw new BadRequestError(
          errorProcess,
          "url params id mismatch with body id",
        );
      }

      const userId = ensureUserIdIsSet(req, errorProcess);

      /**
       * We can opt to have link tables for each option, or have a table with dynamic option type/value
       *
       * This is easier to change than the public contract
       *
       * Right now, the only option is "is seen"
       */
      let updateQueryResult:
        | QueryResult<{
            isSeen: boolean;
          }>
        | undefined;

      const jobEvents: { type: EventType; data: MessageEventData }[] = [];
      let poolClient: PoolClient | undefined;
      try {
        poolClient = await app.pg.pool.connect();
        const existanceCheckQueryResult = await poolClient.query<{
          exists: boolean;
        }>(
          `
            select exists(
              select * from messages m 
              join users u on (u.user_profile_id = $1 or u.id::text = $1)
              where (u.id::text = $1 or u.user_profile_id = $1) and m.id = $2
              limit 1
            )
          `,
          [userId, req.body.messageId],
        );

        if (!existanceCheckQueryResult.rows.at(0)?.exists) {
          throw new NotFoundError(errorProcess, "message not found for user");
        }

        // seen/unseen
        updateQueryResult = await poolClient.query<{ isSeen: boolean }>(
          `
            with message_selection as(
                select m.id from messages m
                join users u on (u.user_profile_id = $1 or u.id::text = $1)
                where 
                    (u.id::text = $1 or u.user_profile_id = $1)
                    and is_delivered = true 
                    and m.id = $2
                    and $3 != m.is_seen
            )
            update messages set is_seen = $3
            where id = any(select id from message_selection)
            returning is_seen as "isSeen", id
              `,
          [userId, req.body.messageId, req.body.isSeen],
        );

        if (updateQueryResult.rowCount) {
          const eventType = req.body.isSeen
            ? MessagingEventType.citizenSeenMessage
            : MessagingEventType.citizenUnseenMessage;
          jobEvents.push({
            type: eventType,
            data: {
              messageId: req.body.messageId,
            },
          });
        }
      } catch (error) {
        throw isLifeEventsError(error)
          ? error
          : new ServerError(
              errorProcess,
              "failed to update message options",
              error,
            );
      } finally {
        poolClient?.release();
      }

      const eventLogger = newMessagingEventLogger(app.pg.pool, req.log);

      for (const event of jobEvents) {
        eventLogger.log(event.type, [event.data]);
      }
    },
  );
}
