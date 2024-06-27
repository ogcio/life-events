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
  userIds: Type.Array(Type.String({ format: "uuid" })),
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

export const getGenericResponseSchema = <T extends TSchema>(dataType: T) =>
  Type.Object({
    data: Type.Array(dataType),
    metadata: Type.Optional(
      Type.Object({
        links: Type.Optional(PaginationLinksSchema),
        totalCount: Type.Optional(Type.Number()),
      }),
    ),
  });
