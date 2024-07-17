import { Static, TSchema, Type } from "@sinclair/typebox";

export const AVAILABLE_LANGUAGES = ["en", "ga"];
export const DEFAULT_LANGUAGE = "en";

export const ReadMessagesSchema = Type.Array(
  Type.Object({
    id: Type.String(),
    subject: Type.String(),
    excerpt: Type.String(),
    plainText: Type.String(),
    richText: Type.String(),
    createdAt: Type.String(),
  }),
);
export type ReadMessages = Static<typeof ReadMessagesSchema>;

export const ReadMessageSchema = Type.Object({
  subject: Type.String(),
  excerpt: Type.String(),
  plainText: Type.String(),
  richText: Type.String(),
});
export type ReadMessage = Static<typeof ReadMessageSchema>;

export const MessageInputSchema = Type.Object({
  threadName: Type.Optional(Type.String()),
  messageName: Type.String(),
  subject: Type.String(),
  excerpt: Type.String(),
  richText: Type.String(),
  plainText: Type.String(),
  lang: Type.String(),
});
export type MessageInput = Static<typeof MessageInputSchema>;

export const TemplateInputSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  interpolations: Type.Record(Type.String(), Type.String()),
});
export type TemplateInput = Static<typeof TemplateInputSchema>;

export const CreateMessageOptionsSchema = Type.Object({
  preferredTransports: Type.Array(Type.String()),
  userIds: Type.Array(Type.String()),
  security: Type.String(),
  scheduleAt: Type.String({ format: "date-time" }),
});
export type CreateMessageOptions = Static<typeof CreateMessageOptionsSchema>;

export const CreateMessageSchema = Type.Composite([
  CreateMessageOptionsSchema,
  Type.Object({
    message: Type.Optional(MessageInputSchema),
    template: Type.Optional(TemplateInputSchema),
  }),
]);
export type CreateMessage = Static<typeof CreateMessageSchema>;

export const PaginationParamsSchema = Type.Object({
  offset: Type.Optional(Type.Integer({ default: 0 })),
  limit: Type.Optional(Type.Integer({ default: 20 })),
});

export type PaginationParams = Static<typeof PaginationParamsSchema>;

export const PaginationLinkSchema = Type.Object({
  href: Type.Optional(Type.String()),
});

export type PaginationLink = Static<typeof PaginationLinkSchema>;

export const PaginationLinksSchema = Type.Object({
  self: PaginationLinkSchema,
  next: Type.Optional(PaginationLinkSchema),
  prev: Type.Optional(PaginationLinkSchema),
  first: PaginationLinkSchema,
  last: PaginationLinkSchema,
  pages: Type.Record(Type.String(), PaginationLinkSchema),
});

export type PaginationLinks = Static<typeof PaginationLinksSchema>;

export const ResponseMetadataSchema = Type.Optional(
  Type.Object({
    links: Type.Optional(PaginationLinksSchema),
    totalCount: Type.Optional(Type.Number()),
  }),
);

export type ResponseMetadata = Static<typeof ResponseMetadataSchema>;

export const getGenericResponseSchema = <T extends TSchema>(dataType: T) =>
  Type.Object({
    data: Type.Array(dataType),
    metadata: ResponseMetadataSchema,
  });

export type GenericResponse<T> = {
  data: T[];
  metadata?: ResponseMetadata;
};

export const MessageEventTypeObject = Type.Object({
  messageId: Type.String({ format: "uuid" }),
  subject: Type.String(),
  receiverFullName: Type.String(),
  eventType: Type.String(),
  eventStatus: Type.String(),
  scheduledAt: Type.String(),
});
export type MessageEventType = Static<typeof MessageEventTypeObject>;

export const MessageEvent = Type.Array(
  Type.Object({
    eventStatus: Type.String(),
    eventType: Type.String(),
    data: Type.Union([
      // Create data
      Type.Object({
        messageId: Type.String(),
        receiverFullName: Type.String(),
        receiverPPSN: Type.String(),
        subject: Type.String(),
        lang: Type.String(),
        excerpt: Type.String(),
        richText: Type.String(),
        plainText: Type.String(),
        threadName: Type.String(),
        transports: Type.Array(Type.String()),
        messageName: Type.String(),
        scheduledAt: Type.String({ format: "date-time" }),
        senderUserId: Type.String(),
        senderFullName: Type.String(),
        senderPPSN: Type.String(),
        organisationName: Type.String(),
      }),
      // Schedule data
      Type.Object({
        messageId: Type.String(),
        jobId: Type.String(),
      }),
      // Error data
      Type.Object({
        messageId: Type.String(),
      }),
    ]),
    createdAt: Type.String({ format: "date-time" }),
  }),
);
