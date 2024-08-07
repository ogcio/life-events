import { FastifyInstance } from "fastify";
import { Static, Type } from "@sinclair/typebox";
import {
  getGenericResponseSchema,
  MessageCreateSchema,
  MessageCreateType,
  PaginationParams,
  PaginationParamsSchema,
  ReadMessageSchema,
  MessageListSchema,
  MessageListItemSchema,
  IdParamsSchema,
  GenericResponse,
} from "../../types/schemaDefinitions";
import { getMessage, processMessages } from "../../services/messages/messages";
import { HttpError } from "../../types/httpErrors";
import { Permissions } from "../../types/permissions";
import { ensureUserCanAccessUser } from "api-auth";
import { QueryResult } from "pg";
import { ServerError, AuthorizationError, NotFoundError } from "shared-errors";
import { utils } from "../../utils";
import { sanitizePagination, getPaginationLinks } from "../../utils/pagination";
import { ensureUserIdIsSet } from "../../utils/authentication-factory";

const MESSAGES_TAGS = ["Messages"];

interface GetAllMessages {
  Querystring: PaginationParams &
    Static<typeof IdParamsSchema> & { status?: "scheduled" | "delivered" };
}

interface GetMessage {
  Params: {
    messageId: string;
  };
}

export const prefix = "/messages";

export default async function messages(app: FastifyInstance) {
  // All messages
  app.get<GetAllMessages>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.MessageSelf.Read]),
      schema: {
        description:
          "Returns all the messages for the requested organisation or the requested recipient",
        tags: MESSAGES_TAGS,
        querystring: Type.Optional(
          Type.Composite([
            Type.Object({
              status: Type.Optional(Type.Literal("delivered")),
            }),
            IdParamsSchema,
            PaginationParamsSchema,
          ]),
        ),
        response: {
          200: getGenericResponseSchema(MessageListSchema),
          400: HttpError,
        },
      },
    },
    async function getMessagesHandler(request, _reply) {
      const errorProcess = "GET_MESSAGES";
      let url = "";
      try {
        url = utils.apiV1Url({
          resourcePath: prefix,
          base: process.env.HOST_URL || "",
        }).href;
      } catch (error) {
        throw new ServerError(errorProcess, "failed to build link url", error);
      }

      const queryRecipientUserId = request.query.recipientUserId;
      const queryOrganisationId = request.query.organisationId;

      if (!queryOrganisationId && !queryRecipientUserId) {
        throw new AuthorizationError(
          errorProcess,
          "not allowed to access messages from all organisations",
        );
      }

      const userIdsRepresentingUser: string[] = [];
      if (queryRecipientUserId) {
        // we must make sure that we consider a user to have theoretically two ids from two separate tables (or databases if the separation occurs)
        const allUserIdsQueryResult = await app.pg.pool.query<{
          profileId?: string;
          messageUserId: string;
        }>(
          `
            select id as "messageUserId", user_profile_id as "profileId" from users where id::text = $1 or user_profile_id = $1
            limit 1
          `,
          [queryRecipientUserId],
        );
        const allUserIds = allUserIdsQueryResult.rows.at(0);
        if (!allUserIds) {
          throw new NotFoundError(errorProcess, "user not found");
        }

        if (
          allUserIds.profileId
            ? allUserIds.profileId !== queryRecipientUserId
            : true && allUserIds.messageUserId !== queryRecipientUserId
        ) {
          throw new AuthorizationError(errorProcess, "illegal user id request");
        }

        userIdsRepresentingUser.push(allUserIds.messageUserId);
        if (allUserIds.profileId) {
          userIdsRepresentingUser.push(allUserIds.profileId);
        }
      }

      // Only delivered query status allowed
      if (
        userIdsRepresentingUser.length &&
        request.query.status !== "delivered"
      ) {
        throw new AuthorizationError(
          errorProcess,
          "only delivered messages allowed",
        );
      }

      // Only query organisation you're allowed to see
      if (
        queryOrganisationId &&
        queryOrganisationId !== request.userData?.organizationId
      ) {
        throw new AuthorizationError(
          errorProcess,
          "illegal organisation request",
        );
      }

      const { limit, offset } = sanitizePagination({
        limit: request.query.limit,
        offset: request.query.offset,
      });

      const MessageListItemWithCount = Type.Composite([
        MessageListItemSchema,
        Type.Object({ count: Type.Number() }),
      ]);

      type QueryRow = Static<typeof MessageListItemWithCount>;

      let messagesQueryResult: QueryResult<QueryRow> | undefined;

      try {
        messagesQueryResult = await app.pg.pool.query<QueryRow>(
          `
            with count_selection as (
              select count(*) from messages
              where
              case when $1::text is not null then organisation_id = $1 else true end
              and case when $5 > 0 then user_id = any ($2) else true end
            )
            select 
              id,
              subject,
              thread_name as "threadName",
              organisation_id as "organisationId",
              user_id as "recipientUserId",
              created_at as "createdAt",
              (select count from count_selection) as "count"
            from messages
            where 
            case when $1::text is not null then organisation_id = $1 else true end
            and case when $5 > 0 then user_id = any ($2) else true end
            order by created_at desc
            limit $3
            offset $4
        `,
          [
            queryOrganisationId || null,
            userIdsRepresentingUser,
            limit,
            offset,
            userIdsRepresentingUser.length,
          ],
        );
      } catch (error) {
        throw new ServerError(
          errorProcess,
          "failed to query organisation messages",
          error,
        );
      }

      const totalCount = messagesQueryResult?.rows.at(0)?.count || 0;

      const links = getPaginationLinks({ totalCount, url, limit, offset });
      const response: GenericResponse<Static<typeof MessageListItemSchema>[]> =
        {
          data:
            messagesQueryResult?.rows.map(
              ({
                id,
                createdAt,
                subject,
                organisationId,
                threadName,
                recipientUserId,
              }) => ({
                id,
                subject,
                createdAt,
                threadName,
                organisationId,
                recipientUserId,
              }),
            ) ?? [],
          metadata: {
            totalCount,
            links,
          },
        };
      return response;
    },
  );

  // Message by id
  app.get<GetMessage>(
    "/:messageId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.MessageSelf.Read]),
      schema: {
        description: "Returns the requested message",
        tags: MESSAGES_TAGS,
        params: {
          messageId: Type.String({
            format: "uuid",
            description: "The requested message unique id",
          }),
        },
        response: {
          200: getGenericResponseSchema(ReadMessageSchema),
          "4xx": HttpError,
          "5xx": HttpError,
        },
      },
    },
    async function getMessageHandler(request, _reply) {
      return {
        data: await getMessage({
          pg: app.pg,
          userId: ensureUserIdIsSet(request, "GET_MESSAGE"),
          messageId: request.params.messageId,
        }),
      };
    },
  );

  app.post<{ Body: MessageCreateType }>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [
          Permissions.Message.Write,
          Permissions.Scheduler.Write,
        ]),
      schema: {
        description: "Creates a message",
        tags: MESSAGES_TAGS,
        body: MessageCreateSchema,
        response: {
          "4xx": HttpError,
          "5xx": HttpError,
          201: Type.Object({
            data: Type.Object({
              id: Type.String({
                format: "uuid",
                description: "The unique id of the created message",
              }),
            }),
          }),
        },
      },
    },
    async function createMessageHandler(request, reply) {
      const errorKey = "FAILED_TO_CREATE_MESSAGE";

      const userData = ensureUserCanAccessUser(
        request.userData,
        request.body.recipientUserId,
        errorKey,
      );

      const messages = await processMessages({
        inputMessages: [
          {
            receiverUserId: request.body.recipientUserId,
            ...request.body,
            ...request.body.message,
            organisationId: userData.organizationId!,
          },
        ],
        scheduleAt: request.body.scheduleAt,
        errorProcess: errorKey,
        pgPool: app.pg.pool,
        logger: request.log,
        senderUser: {
          profileId: userData.userId,
          organizationId: userData.organizationId,
        },
        allOrNone: true,
      });
      if (messages.errors.length > 0) {
        throw messages.errors[0];
      }

      reply.statusCode = 201;
      return { data: { id: messages.scheduledMessages[0].entityId } };
    },
  );

  // Either we remove this code and re-write it whenever we need to broadcast, or we keep it to quickly get broadcasting going?
  // app.post<{
  //   Body: {
  //     templateMetaId: string;
  //     userIds: string[];
  //     transportations: string[];
  //     security: string;
  //     scheduledAt: string;
  //   };
  // }>(
  //   "/template",
  //   {
  //     preValidation: (req, res) =>
  //       app.checkPermissions(req, res, [Permissions.Template.Write]),
  //     schema: {
  //       body: Type.Object({
  //         templateMetaId: Type.String({ format: "uuid" }),
  //         userIds: Type.Array(Type.String()),
  //         transportations: Type.Array(
  //           Type.Union([
  //             Type.Literal("email"),
  //             Type.Literal("sms"),
  //             Type.Literal("lifeEvent"),
  //           ]),
  //         ),
  //         security: Type.String(),
  //         scheduledAt: Type.String({ format: "date-time" }),
  //       }),
  //       response: {
  //         200: Type.Null(),
  //         "4xx": HttpError,
  //         "5xx": HttpError,
  //       },
  //     },
  //   },
  //   async (req, _res) => {
  //     const userId = req.userData?.userId;
  //     const errorKey = "FAILED_TO_CREATE_MESSAGE_FROM_TEMPLATE";
  //     if (!userId) {
  //       throw new ServerError(errorKey, "no user id on request");
  //     }

  //     if (!req.userData?.organizationId) {
  //       throw new AuthorizationError(
  //         errorKey,
  //         "no organisation id associated to request user",
  //       );
  //     }

  //     const eventLogger = newMessagingEventLogger(app.pg.pool, app.log);

  //     // Get users
  //     const profileSdk = new Profile(req.userData!.userId);
  //     const messageSdk = {
  //       selectUsers(ids: string[]) {
  //         return getUserProfiles(ids, app.pg.pool);
  //       },
  //     };

  //     const profileService = ProfileSdkFacade(profileSdk, messageSdk);
  //     const allUsers = await profileService.selectUsers(req.body.userIds);
  //     const sender = (await profileService.selectUsers([userId])).data?.at(0);

  //     if (allUsers.error) {
  //       throw new ServerError(errorKey, "couldn't fetch user profiles");
  //     }

  //     if (!allUsers.data?.length) {
  //       throw new NotFoundError(errorKey, "no receiver profiles found");
  //     }

  //     // Get template contents
  //     const messageService = newMessagingService(app.pg.pool);

  //     const contents = await messageService.getTemplateContents(
  //       req.body.templateMetaId,
  //     );

  //     if (!contents.length) {
  //       throw new NotFoundError(errorKey, "no template contents found");
  //     }

  //     const allUsersLookup = allUsers.data.reduce<{
  //       [userId: string]: (typeof allUsers.data)[0];
  //     }>((acc, user) => {
  //       acc[user.id] = user;
  //       return acc;
  //     }, {});

  //     // Create messages
  //     let createdTemplateMessages: Awaited<
  //       ReturnType<typeof messageService.createTemplateMessages>
  //     > = [];
  //     try {
  //       createdTemplateMessages = await messageService.createTemplateMessages(
  //         contents,
  //         allUsers.data.map((u) => ({
  //           ...u,
  //           email: u.email || "",
  //           phone: u.phone || "",
  //           userId: u.id,
  //         })),
  //         req.body.transportations,
  //         req.body.security,
  //         req.body.scheduledAt,
  //         req.userData!.organizationId!,
  //       );

  //       await eventLogger.log(
  //         MessagingEventType.createRawMessage,
  //         createdTemplateMessages.map((msg) => {
  //           const user = allUsersLookup[msg.userId];

  //           return {
  //             excerpt: msg.excerpt,
  //             lang: msg.lang,
  //             messageId: msg.messageId,
  //             messageName: "", // message name isn't feature defined at this point
  //             plainText: msg.plainText,
  //             receiverFullName:
  //               `${user.firstName || ""} ${user.lastName || ""}`.trim(),
  //             receiverPPSN: user.ppsn || "",
  //             richText: msg.richText,
  //             subject: msg.subject,
  //             threadName: "", // thread name isn't feature defined at this point
  //             transports: req.body.transportations,
  //             scheduledAt: req.body.scheduledAt,
  //             organisationName: "", // will be derived from jwt once logto is integrated
  //             senderFullName: sender
  //               ? `${sender.firstName || ""} ${sender.lastName || ""}`.trim()
  //               : "",
  //             senderPPSN: sender?.ppsn || "",
  //             senderUserId: sender?.id || userId,
  //           };
  //         }),
  //       );
  //     } catch (err) {
  //       throw new ServerError(
  //         errorKey,
  //         "failed to create messages from template",
  //       );
  //     }

  //     // Schedule messages
  //     try {
  //       const jobs = await messageService.scheduleMessages(
  //         createdTemplateMessages,
  //         req.body.scheduledAt,
  //         req.userData?.organizationId,
  //       );

  //       eventLogger.log(
  //         MessagingEventType.scheduleMessage,

  //         jobs.map((job) => {
  //           const user = allUsersLookup[job.userId];
  //           return {
  //             jobId: job.jobId,
  //             messageId: job.entityId,
  //             receiverFullName: `${user.firstName} ${user.lastName}`,
  //             receiverPPSN: user.ppsn,
  //             receiverUserId: job.userId,
  //           };
  //         }),
  //       );
  //     } catch (err) {
  //       await eventLogger.log(
  //         MessagingEventType.scheduleMessageError,
  //         createdTemplateMessages.map((msg) => ({ messageId: msg.messageId })),
  //       );
  //       throw err;
  //     }
  //   },
  // );
}
