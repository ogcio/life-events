import { Static, TSchema, Type } from "@sinclair/typebox";
import {
  PAGINATION_LIMIT_DEFAULT,
  PAGINATION_MAX_LIMIT,
  PAGINATION_MIN_LIMIT,
  PAGINATION_MIN_OFFSET,
} from "../utils/pagination";

export const AVAILABLE_LANGUAGES = ["en", "ga"];
export const DEFAULT_LANGUAGE = "en";

export const TypeboxStringEnum = <T extends string[]>(
  items: [...T],
  defaultValue?: string,
) =>
  Type.Unsafe<T[number]>({
    type: "string",
    enum: items,
    default: defaultValue,
  });

export const EditableProviderTypesSchema = TypeboxStringEnum(["sms", "email"]);
export type EditableProviderTypes = Static<typeof EditableProviderTypesSchema>;

export const AllProviderTypesSchema = TypeboxStringEnum([
  "sms",
  "email",
  "lifeEvent",
]);
export type AllProviderTypes = Static<typeof AllProviderTypesSchema>;

export const ConfidentialSecurity = "confidential";
export const PublicSecurity = "public";
export const SecurityLevelsSchema = TypeboxStringEnum(
  [ConfidentialSecurity, PublicSecurity],
  PublicSecurity,
);
export type SecurityLevels = Static<typeof SecurityLevelsSchema>;

export const MessageListItemSchema = Type.Object({
  id: Type.String(),
  subject: Type.String(),
  createdAt: Type.String(),
  threadName: Type.String(),
  organisationId: Type.String(),
  recipientUserId: Type.String(),
});
export const MessageListSchema = Type.Array(MessageListItemSchema);
export type MessageList = Static<typeof MessageListSchema>;

export const ReadMessageSchema = Type.Object({
  subject: Type.String(),
  createdAt: Type.String(),
  threadName: Type.String(),
  organisationId: Type.String(),
  recipientUserId: Type.String(),
  excerpt: Type.String(),
  plainText: Type.String(),
  richText: Type.String(),
  isSeen: Type.Boolean(),
  security: SecurityLevelsSchema,
});
export type ReadMessage = Static<typeof ReadMessageSchema>;

export const MessageInputSchema = Type.Object({
  threadName: Type.Optional(Type.String()),
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
  preferredTransports: Type.Array(AllProviderTypesSchema),
  userIds: Type.Array(Type.String()),
  security: SecurityLevelsSchema,
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
  offset: Type.Optional(
    Type.Integer({
      default: PAGINATION_MIN_OFFSET,
      minimum: PAGINATION_MIN_OFFSET,
    }),
  ),
  limit: Type.Optional(
    Type.Integer({
      default: PAGINATION_LIMIT_DEFAULT,
      minimum: PAGINATION_MIN_LIMIT,
      maximum: PAGINATION_MAX_LIMIT,
    }),
  ),
});

export type PaginationParams = Static<typeof PaginationParamsSchema>;

export const IdParamsSchema = Type.Object({
  recipientUserId: Type.Optional(
    Type.String({
      description: "Either recipientUserId and organisationId are mandatory",
    }),
  ),
  organisationId: Type.Optional(
    Type.String({
      description: "Either recipientUserId and organisationId are mandatory",
    }),
  ),
});

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

export const MessageEventListSchema = Type.Array(
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

export type MessageEventListType = Static<typeof MessageEventListSchema>;

export const MessageEventSchema = Type.Array(
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
        scheduledAt: Type.String({ format: "date-time" }),
        senderUserId: Type.String(),
        senderFullName: Type.String(),
        senderPPSN: Type.String(),
        organisationName: Type.String(),
        security: SecurityLevelsSchema,
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

export const MessageCreateSchema = Type.Object({
  preferredTransports: Type.Array(AllProviderTypesSchema),
  recipientUserId: Type.String(),
  security: SecurityLevelsSchema,
  bypassConsent: Type.Boolean({ default: false }),
  scheduleAt: Type.String({ format: "date-time" }),
  message: Type.Object({
    threadName: Type.String(),
    subject: Type.String(),
    excerpt: Type.String(),
    richText: Type.String(),
    plainText: Type.String(),
    lang: Type.String(),
  }),
});

export type MessageCreateType = Static<typeof MessageCreateSchema>;

export const ProviderListItemSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  providerName: Type.String(),
  isPrimary: Type.Boolean(),
  type: EditableProviderTypesSchema,
});

export const ProviderListSchema = Type.Array(ProviderListItemSchema);

export const EmailCreateSchema = Type.Object({
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

export const SmsCreateSchema = Type.Object({
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

export const ProviderCreateSchema = Type.Union([
  EmailCreateSchema,
  SmsCreateSchema,
]);

export const EmailProviderSchema = Type.Composite([
  Type.Object({ id: Type.String({ format: "uuid" }) }),
  EmailCreateSchema,
]);

export const SmsProviderSchema = Type.Composite([
  Type.Object({ id: Type.String({ format: "uuid" }) }),
  SmsCreateSchema,
]);

export const ProviderUpdateSchema = Type.Union([
  EmailProviderSchema,
  SmsProviderSchema,
]);
