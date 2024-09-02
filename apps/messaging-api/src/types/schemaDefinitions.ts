import { Static, TSchema, Type } from "@sinclair/typebox";
import {
  PAGINATION_LIMIT_DEFAULT,
  PAGINATION_MAX_LIMIT,
  PAGINATION_MIN_OFFSET,
} from "../utils/pagination.js";
import { Value } from "@sinclair/typebox/value";

export const AVAILABLE_LANGUAGES = ["en", "ga"];
export const DEFAULT_LANGUAGE = "en";

export const TypeboxStringEnum = <T extends string[]>(
  items: [...T],
  defaultValue?: string,
  description?: string,
) =>
  Type.Unsafe<T[number]>({
    type: "string",
    enum: items,
    default: defaultValue,
    description,
  });

export type AcceptedQueryBooleanValues = "true" | "false" | "0" | "1";

// Did this to allow boolean-like
// query parameters
export const TypeboxBooleanEnum = (
  defaultValue?: string,
  description?: string,
) => TypeboxStringEnum(["true", "false", "0", "1"], defaultValue, description);

export const TypeboxBooleanEnumParser = Type.Transform(
  Type.Union([
    Type.Literal("true"),
    Type.Literal("false"),
    Type.Literal("0"),
    Type.Literal("1"),
  ]),
)
  .Decode((stringValue) => Boolean(stringValue))
  .Encode((boolVal) => (boolVal ? "true" : "false"));

export const parseBooleanEnum = (inputValue: AcceptedQueryBooleanValues) =>
  Value.Decode(TypeboxBooleanEnumParser, inputValue);

export const EditableProviderTypesSchema = TypeboxStringEnum(
  ["sms", "email"],
  undefined,
  "Provider types that can be manipulated",
);
export type EditableProviderTypes = Static<typeof EditableProviderTypesSchema>;

export const AllProviderTypesSchema = TypeboxStringEnum(
  ["sms", "email", "lifeEvent"],
  undefined,
  "All the available provider types",
);
export type AllProviderTypes = Static<typeof AllProviderTypesSchema>;

export const ConfidentialSecurity = "confidential";
export const PublicSecurity = "public";
export const SecurityLevelsSchema = TypeboxStringEnum(
  [ConfidentialSecurity, PublicSecurity],
  undefined,
  "Confidentiality level of the message",
);
export type SecurityLevels = Static<typeof SecurityLevelsSchema>;

export const MessageListItemSchema = Type.Object({
  id: Type.String({ description: "Unique Id of the message" }),
  subject: Type.String({ description: "Subject" }),
  createdAt: Type.String({ description: "Creation date time" }),
  threadName: Type.String({
    description: "Thread Name used to group messages",
  }),
  organisationId: Type.String({ description: "Organisation sender id" }),
  recipientUserId: Type.String({ description: "Unique id of the recipient" }),
});
export const MessageListSchema = Type.Array(MessageListItemSchema);
export type MessageList = Static<typeof MessageListSchema>;

export const ReadMessageSchema = Type.Object({
  subject: Type.String({
    description:
      "Subject. This is the only part that will be seen outside of the messaging platform is security is 'confidential'",
  }),
  createdAt: Type.String({ description: "Creation date time" }),
  threadName: Type.String({
    description: "Thread Name used to group messages",
  }),
  organisationId: Type.String({ description: "Organisation sender id" }),
  recipientUserId: Type.String({ description: "Unique id of the recipient" }),
  excerpt: Type.String({ description: "Brief description of the message" }),
  plainText: Type.String({ description: "Plain text version of the message" }),
  richText: Type.String({ description: "Rich text version of the message" }),
  isSeen: Type.Boolean({
    description: "True if the message has already been seen by the recipient",
  }),
  security: SecurityLevelsSchema,
  senderUserProfileId: Type.String({
    description: "Unique id of the sender from the Life Events building block",
  }),
});
export type ReadMessage = Static<typeof ReadMessageSchema>;

export const MessageInputSchema = Type.Object({
  threadName: Type.Optional(
    Type.String({
      description: "Thread Name used to group messages",
      minLength: 1,
    }),
  ),
  subject: Type.String({
    description:
      "Subject. This is the only part that will be seen outside of the messaging platform is security is 'confidential'",
    minLength: 1,
  }),
  excerpt: Type.String({
    description: "Brief description of the message",
    minLength: 1,
  }),
  plainText: Type.String({
    description: "Plain text version of the message",
    minLength: 1,
  }),
  richText: Type.String({
    description: "Rich text version of the message",
    minLength: 1,
  }),
  lang: TypeboxStringEnum(
    ["en", "ga"],
    undefined,
    "Language used to send the message",
  ),
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

export const PaginationParamsSchema = Type.Object({
  offset: Type.Optional(
    Type.String({
      pattern: "^[0-9][0-9]*|undefined$",
      default: PAGINATION_MIN_OFFSET.toString(),
      description:
        "Indicates where to start fetching data or how many records to skip, defining the initial position within the list",
    }),
  ),
  limit: Type.Optional(
    Type.String({
      default: PAGINATION_LIMIT_DEFAULT.toString(),
      pattern: `^([1-9]|${PAGINATION_MAX_LIMIT})|undefined$`,
      description: `Indicates the maximum number (${PAGINATION_MAX_LIMIT}) of items that will be returned in a single request`,
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

export const getPaginationLinkSchema = (description?: string) =>
  Type.Object({
    href: Type.Optional(Type.String({ description })),
  });

export const PaginationLinksSchema = Type.Object(
  {
    self: getPaginationLinkSchema("URL pointing to the request itself"),
    next: Type.Optional(
      getPaginationLinkSchema(
        "URL pointing to the next page of results in a paginated response. If there are no more results, this field may be omitted",
      ),
    ),
    prev: Type.Optional(
      getPaginationLinkSchema(
        "URL pointing to the previous page of results in a paginated response. If there are no more results, this field may be omitted",
      ),
    ),
    first: getPaginationLinkSchema(
      "URL pointing to the first page of results in a paginated response",
    ),
    last: getPaginationLinkSchema(
      "URL pointing to the first page of results in a paginated response",
    ),
    pages: Type.Record(Type.String(), getPaginationLinkSchema(), {
      description:
        "It may contain a list of other useful URLs, e.g. one entry for page:'page 1', 'page 2'",
    }),
  },
  { description: "Object containing the links to the related endpoints" },
);

export type PaginationLinks = Static<typeof PaginationLinksSchema>;

export const ResponseMetadataSchema = Type.Optional(
  Type.Object({
    links: Type.Optional(PaginationLinksSchema),
    totalCount: Type.Optional(
      Type.Number({
        description: "Number representing the total number of available items",
      }),
    ),
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
    id: Type.String({
      format: "uuid",
      description: "Unique id of the event",
    }),
    messageId: Type.String({
      format: "uuid",
      description: "Unique id of the related message",
    }),
    subject: Type.String({ description: "Subject of the related message" }),
    receiverFullName: Type.String({
      description: "Full name of the recipient",
    }),
    eventType: Type.String({ description: "Event type description" }),
    eventStatus: Type.String({ description: "Status for event type" }),
    scheduledAt: Type.String({
      description:
        "Date and time which describes when the message has to be sent",
    }),
  }),
);

export type MessageEventListType = Static<typeof MessageEventListSchema>;

export const MessageEventSchema = Type.Array(
  Type.Object({
    eventType: Type.String({ description: "Event type description" }),
    eventStatus: Type.String({ description: "Status for event type" }),
    data: Type.Union([
      // Create data
      Type.Object({
        messageId: Type.String({
          description: "Unique id of the related message",
        }),
        receiverFullName: Type.String({
          description: "Full name of the recipient",
        }),
        receiverPPSN: Type.String({
          description: "PPSN of the recipient",
        }),
        subject: Type.String({ description: "Subject of the related message" }),
        lang: Type.String({ description: "Language of the related message" }),
        excerpt: Type.String({ description: "Excerpt of the related message" }),
        richText: Type.String({
          description: "Rich text content of the related message",
        }),
        plainText: Type.String({
          description: "Plain text context of the related message",
        }),
        threadName: Type.String({
          description: "Thread name of the related message",
        }),
        transports: Type.Array(Type.String(), {
          description: "Selected transports to send the message",
        }),
        scheduledAt: Type.String({
          format: "date-time",
          description:
            "Date and time which describes when the message has to be sent",
        }),
        senderUserId: Type.String({
          description: "Unique user id of the sender",
        }),
        senderFullName: Type.String({
          description: "Full name of the sender",
        }),
        senderPPSN: Type.String({
          description: "PPSN of the sender",
        }),
        organisationName: Type.String({
          description: "Organisation related to the sender",
        }),
        security: SecurityLevelsSchema,
        bypassConsent: Type.Boolean({
          description:
            "If true, the message will be sent even if the recipient didn't accept the organisation's invitation",
        }),
      }),
      // Schedule data
      Type.Object({
        messageId: Type.String({
          description: "Unique id of the related message",
        }),
        jobId: Type.String({ description: "Unique id of the job" }),
      }),
      // Error data
      Type.Object({
        messageId: Type.String({
          description: "Unique id of the related message",
        }),
      }),
    ]),
    createdAt: Type.String({
      format: "date-time",
      description:
        "Date and time which describes when the event has been recorded",
    }),
  }),
);

export const MessageCreateSchema = Type.Object({
  preferredTransports: Type.Array(AllProviderTypesSchema, {
    description:
      "The list of the preferred transports to use. If the selected transports are not available for the recipient, others will be used",
  }),
  recipientUserId: Type.String({
    description: "Unique user id of the recipient",
  }),
  security: SecurityLevelsSchema,
  bypassConsent: Type.Boolean({
    default: false,
    description:
      "If true, the message will be sent even if the recipient didn't accept the organisation's invitation",
  }),
  scheduleAt: Type.String({
    format: "date-time",
    description: "Date and time of when schedule the message",
  }),
  message: MessageInputSchema,
});

export type MessageCreateType = Static<typeof MessageCreateSchema>;

export const ProviderListItemSchema = Type.Object({
  id: Type.String({ format: "uuid", description: "Unique id of the provider" }),
  providerName: Type.String({ description: "Name of the provider" }),
  isPrimary: Type.Boolean({
    description:
      "If true, the provider is set as primary for the selected type for the current organisation. Please note, each organisation can only have one primary provider for each type",
  }),
  type: EditableProviderTypesSchema,
});

export const ProviderListSchema = Type.Array(ProviderListItemSchema);

export const EmailCreateSchema = Type.Object({
  providerName: Type.String({
    description: "Name of the provider",
    minLength: 1,
  }),
  isPrimary: Type.Boolean({
    description:
      "If true, the provider is set as primary for the selected type for the current organisation. Please note, each organisation can only have one primary provider for each type",
  }),
  type: TypeboxStringEnum(["email"]),
  smtpHost: Type.String({
    description: "Address of the SMTP host",
    minLength: 1,
  }),
  smtpPort: Type.Number({
    description: "Port of the SMTP host",
  }),
  username: Type.String({
    description: "Username to use to log into the SMTP server",
    minLength: 1,
  }),
  password: Type.String({
    description: "Password to use to log into the SMTP server",
    minLength: 1,
  }),
  throttle: Type.Optional(
    Type.Number({
      description:
        "Optional field to adjust how long time between each mail, in miliseconds",
    }),
  ),
  fromAddress: Type.String({
    description: "Email address to use as sender",
    minLength: 1,
  }),
  ssl: Type.Boolean({
    description: "Is connection to the SMTP server secure?",
  }),
});

export const SmsCreateSchema = Type.Object({
  providerName: Type.String({
    description: "Name of the provider",
    minLength: 1,
  }),
  isPrimary: Type.Boolean({
    description:
      "If true, the provider is set as primary for the selected type for the current organisation. Please note, each organisation can only have one primary provider for each type",
  }),
  type: TypeboxStringEnum(["sms"]),
  config: Type.Union([
    Type.Object({
      type: TypeboxStringEnum(["AWS"]),
      accessKey: Type.String({ minLength: 1 }),
      secretAccessKey: Type.String({ minLength: 1 }),
      region: Type.String({ minLength: 1 }),
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
