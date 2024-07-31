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
  offset: Type.Optional(Type.Integer({ default: 0, minimum: 0 })),
  limit: Type.Optional(Type.Integer({ default: 20, minimum: 1 })),
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

export const getGenericResponseSchema = <T extends TSchema>(dataType: T) =>
  Type.Object({
    data: dataType,
    metadata: ResponseMetadataSchema,
  });

export type GenericResponse<T> = {
  data: T;
  metadata?: Static<typeof ResponseMetadataSchema>;
};

export const MessageEventList = Type.Array(
  Type.Object({
    eventId: Type.String({ format: "uuid" }),
    messageId: Type.String({ format: "uuid" }),
    subject: Type.String(),
    receiverFullName: Type.String(),
    eventType: Type.String(),
    eventStatus: Type.String(),
    scheduledAt: Type.String(),
  }),
);

export type MessageEventListType = Static<typeof MessageEventList>;

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
        security: Type.String(),
        bypassConsent: Type.Boolean(),
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

export const PreferredTransports = Type.Array(
  Type.Union([
    Type.Literal("email"),
    Type.Literal("sms"),
    Type.Literal("lifeEvent"),
  ]),
);

export const MessageCreate = Type.Object({
  preferredTransports: PreferredTransports,
  userId: Type.String(),
  security: Type.String(),
  bypassConsent: Type.Boolean({ default: false }),
  scheduleAt: Type.String({ format: "date-time" }),
  message: Type.Object({
    threadName: Type.String(),
    messageName: Type.String(),
    subject: Type.String(),
    excerpt: Type.String(),
    richText: Type.String(),
    plainText: Type.String(),
    lang: Type.String(),
  }),
});

export type MessageCreateType = Static<typeof MessageCreate>;

export const ProviderType = Type.Union([
  Type.Literal("sms"),
  Type.Literal("email"),
]);

export const ProviderListItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  providerName: Type.String(),
  isPrimary: Type.Boolean(),
  type: ProviderType,
});

export const ProviderList = Type.Array(ProviderListItem);

export const EmailCreate = Type.Object({
  providerName: Type.String(),
  isPrimary: Type.Boolean(),
  type: Type.Literal("email"),
  smtpHost: Type.String(),
  smtpPort: Type.Number(),
  username: Type.String(),
  password: Type.String(),
  throttle: Type.Optional(Type.Number()),
  fromAddress: Type.String(),
  ssl: Type.Boolean(),
});

export const SmsCreate = Type.Object({
  providerName: Type.String(),
  isPrimary: Type.Boolean(),
  type: Type.Literal("sms"),
  config: Type.Union([
    Type.Object({
      type: Type.Literal("AWS"),
      accessKey: Type.String(),
      secretAccessKey: Type.String(),
      region: Type.String(),
    }),
  ]),
});

export const ProviderCreate = Type.Union([EmailCreate, SmsCreate]);

export const EmailProvider = Type.Composite([
  Type.Object({ id: Type.String({ format: "uuid" }) }),
  EmailCreate,
]);

export const SmsProvider = Type.Composite([
  Type.Object({ id: Type.String({ format: "uuid" }) }),
  SmsCreate,
]);

export const ProviderUpdate = Type.Union([EmailProvider, SmsProvider]);
