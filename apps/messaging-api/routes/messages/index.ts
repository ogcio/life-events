import { FastifyInstance } from "fastify";
import { Type } from "@sinclair/typebox";
import {
  getGenericResponseSchema,
  MessageCreate,
  MessageCreateType,
  ReadMessageSchema,
  ReadMessagesSchema,
} from "../../types/schemaDefinitions";
import { getMessage, getMessages } from "../../services/messages/messages";
import { newMessagingService } from "../../services/messages/messaging";
import { getUserProfiles } from "../../services/users/shared-users";
import { AuthorizationError, NotFoundError, ServerError } from "shared-errors";
import {
  MessagingEventType,
  newMessagingEventLogger,
} from "../../services/messages/eventLogger";
import { HttpError } from "../../types/httpErrors";
import { Permissions } from "../../types/permissions";
import { getProfileSdk } from "../../utils/authentication-factory";

const MESSAGES_TAGS = ["Messages"];

interface GetAllMessages {
  Querystring: {
    type?: string;
  };
}

interface GetMessage {
  Params: {
    messageId: string;
  };
}

export default async function messages(app: FastifyInstance) {
  // All messages
  app.get<GetAllMessages>(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.MessageSelf.Read]),
      schema: {
        tags: MESSAGES_TAGS,
        querystring: Type.Optional(
          Type.Object({
            type: Type.Optional(Type.String()),
          }),
        ),
        response: {
          200: getGenericResponseSchema(ReadMessagesSchema),
          400: HttpError,
        },
      },
    },
    async function getMessagesHandler(request, _reply) {
      return {
        data: await getMessages({
          pg: app.pg,
          userId: request.userData!.userId,
          transportType: request.query?.type,
        }),
      };
    },
  );

  // Message by id
  app.get<GetMessage>(
    "/:messageId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.MessageSelf.Read]),
      schema: {
        tags: MESSAGES_TAGS,
        params: {
          messageId: Type.String({
            format: "uuid",
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
          userId: request.userData!.userId,
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
        tags: MESSAGES_TAGS,
        body: MessageCreate,
        response: {
          "4xx": HttpError,
          "5xx": HttpError,
          // We want to add self link, count=1 eg. in the metadata field?
          // 201: getGenericResponseSchema(Type.String({ format: "uuid" })),
          201: Type.Object({
            data: Type.Object({
              messageId: Type.String({ format: "uuid" }),
            }),
          }),
        },
      },
    },
    async function createMessageHandler(request, reply) {
      const errorKey = "FAILED_TO_CREATE_MESSAGE";

      const senderUserId = request.userData?.userId;
      const organisationId = request.userData?.organizationId;

      if (!senderUserId || !organisationId) {
        throw new AuthorizationError(errorKey, "unauthorized");
      }

      const eventLogger = newMessagingEventLogger(app.pg.pool, app.log);

      const receiverUserId = request.body.userId;

      const [receiverUser] = await getUserProfiles(
        [receiverUserId],
        app.pg.pool,
      );

      if (!receiverUser) {
        throw new NotFoundError(
          errorKey,
          "failed to get receiver user profile",
        );
      }

      const profileSdk = await getProfileSdk(request.userData?.organizationId);
      const { data, error } = await profileSdk.getUser(
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        request.userData?.userId!,
      );

      if (error) {
        throw new ServerError(
          errorKey,
          "failed to get sender user profile from profile sdk",
          error,
        );
      }

      if (!data) {
        throw new NotFoundError(
          errorKey,
          "sender user from profile sdk was undefined",
        );
      }

      const senderFullName = `${data.firstName} ${data.lastName}`.trim();
      const receiverFullName =
        `${receiverUser.firstName} ${receiverUser.lastName}`.trim();

      // Create
      const messageService = newMessagingService(app.pg.pool);

      let message = null;
      try {
        message = await messageService.createMessage({
          receiverUserId,
          ...request.body,
          ...request.body.message,
          organisationId,
        });
      } catch (error) {
        throw new ServerError(errorKey, "failed to create message", error);
      }

      await eventLogger.log(MessagingEventType.createRawMessage, [
        {
          organisationName: organisationId,
          bypassConsent: request.body.bypassConsent,
          security: request.body.security,
          transports: request.body.preferredTransports,
          scheduledAt: request.body.scheduleAt,
          messageId: message.id,
          ...request.body.message,
          senderFullName,
          senderPPSN: data.ppsn || "",
          senderUserId,
          receiverFullName,
          receiverPPSN: receiverUser.ppsn,
          receiverUserId,
        },
      ]);

      await eventLogger.log(MessagingEventType.scheduleMessage, [
        { messageId: message.id },
      ]);

      // Schedule
      let jobId = "";
      try {
        const [job] = await messageService.scheduleMessages(
          [{ messageId: message.id, userId: message.user_id }],
          request.body.scheduleAt,
          organisationId,
        );
        jobId = job.jobId;
      } catch (err) {
        await eventLogger.log(MessagingEventType.scheduleMessageError, [
          {
            messageId: message.id,
            jobId,
          },
        ]);
      }

      reply.statusCode = 201;
      return { data: { messageId: message.id } };
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
