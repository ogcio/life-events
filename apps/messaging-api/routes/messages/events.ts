import { FastifyInstance } from "fastify";
import { Type } from "@sinclair/typebox";
import {
  GenericResponse,
  getGenericResponseSchema,
  MessageEventSchema,
  MessageEventListType,
  MessageEventListSchema,
  PaginationParams,
  PaginationParamsSchema,
} from "../../types/schemaDefinitions";

import { MessageEventData } from "../../services/messages/eventLogger";
import { HttpError } from "../../types/httpErrors";
import { Permissions } from "../../types/permissions";
import { getPaginationLinks, sanitizePagination } from "../../utils/pagination";
import { ensureOrganizationIdIsSet } from "../../utils/authentication-factory";

const tags = ["Message events"];

export const prefix = "/message-events";

export default async function messages(app: FastifyInstance) {
  app.get<{
    Querystring: { search?: string } & PaginationParams;
    Response: GenericResponse<MessageEventListType>;
  }>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.Event.Read]),
      schema: {
        tags,
        querystring: Type.Optional(
          Type.Composite([
            Type.Object({
              search: Type.Optional(Type.String()),
            }),
            PaginationParamsSchema,
          ]),
        ),
        response: {
          200: getGenericResponseSchema(MessageEventListSchema),
          "5xx": HttpError,
          "4xx": HttpError,
        },
      },
    },
    async function getEventsHandler(request, _reply) {
      const { limit, offset } = sanitizePagination({
        limit: request.query.limit,
        offset: request.query.offset,
      });

      const textSearchILikeClause = request.query?.search
        ? `%${request.query.search}%`
        : "%%";
      const eventQueryResult = await app.pg.pool.query<
        MessageEventListType[number] & { count: number }
      >(
        `
        with message_count as(
          select count (*) from
          messages where organisation_id = $1
        ), message_selections as (
          select 
            id,
            subject,
            (select * from message_count) as "count",
            scheduled_at
          from messages
          where organisation_id = $1
          and subject ilike $2
          order by scheduled_at desc
          limit $3 offset $4
          ) select
              l.id as "eventId",
              l.message_id as "messageId",
              m.count::int,
              (l.data ->> 'subject') as subject,
              (l.data ->> 'receiverFullName') as "receiverFullName",
              event_status as "eventStatus",
              event_type as "eventType",
              m.scheduled_at as "scheduledAt"
            from message_selections m
            join messaging_event_logs l on m.id = l.message_id
            order by l.created_at;
        `,
        [
          ensureOrganizationIdIsSet(request, "GET_MESSAGES"),
          textSearchILikeClause,
          limit,
          offset,
        ],
      );

      const aggregations = eventQueryResult.rows.reduce<
        Record<string, MessageEventListType[number]>
      >((acc, cur) => {
        if (!acc[cur.messageId]) {
          acc[cur.messageId] = cur;
          return acc;
        }

        acc[cur.messageId].eventStatus = cur.eventStatus;
        acc[cur.messageId].eventType = cur.eventType;

        return acc;
      }, {});

      const events: MessageEventListType = Object.values(aggregations).sort(
        (a, b) =>
          new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
      );

      const baseUrl = () => new URL(`/api/v1${prefix}`, process.env.HOST_URL);
      const totalCount = eventQueryResult.rows.at(0)?.count || 0;

      const links = getPaginationLinks({
        totalCount,
        url: baseUrl().href,
        limit,
        offset,
      });

      const response: GenericResponse<MessageEventListType> = {
        data: events,
        metadata: {
          links,
          totalCount,
        },
      };
      return response;
    },
  );

  app.get<{
    Params: {
      eventId: string;
    };
  }>(
    "/:eventId",
    {
      schema: {
        tags,
        response: {
          200: Type.Object({
            data: MessageEventSchema,
          }),
          "5xx": HttpError,
          "4xx": HttpError,
        },
      },
    },
    async function getEventHandler(request, _reply) {
      const eventId = request.params.eventId;
      const queryResult = await app.pg.pool.query<{
        eventStatus: string;
        eventType: string;
        data: MessageEventData;
        createdAt: string;
      }>(
        `
        with message_id_cte as (
            select 
                message_id
            from messaging_event_logs
            where id=$1
        )
        select 
            event_status as "eventStatus",
            event_type as "eventType",
            data,
            created_at as "createdAt"
        from messaging_event_logs
        where message_id = (select message_id from message_id_cte)
        order by created_at desc
    `,
        [eventId],
      );

      return { data: queryResult.rows };
    },
  );
}
