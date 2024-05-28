import { Static, Type } from "@sinclair/typebox";

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

export const CreateTranslatableMessageSchema = Type.Composite([
  CreateMessageOptionsSchema,
  Type.Object({
    messages: Type.Mapped(AVAILABLE_LANGUAGES, () => MessageInputSchema),
  }),
]);
export type CreateTranslatableMessage = Static<
  typeof CreateTranslatableMessageSchema
>;
