import { Static, Type } from "@sinclair/typebox";

export const PostAuthFormData = Type.Object({
  public_servant: Type.Optional(Type.String()),
  id_token: Type.String(),
  password: Type.String(),
});

export type PostAuthFormData = Static<typeof PostAuthFormData>;

export const GetTimelineData = Type.Object({
  searchQuery: Type.Optional(Type.String()),
  startDate: Type.Optional(Type.String()),
  endDate: Type.Optional(Type.String()),
  services: Type.Optional(Type.String()),
});

export type GetTimelineData = Static<typeof GetTimelineData>;

export const Event = Type.Object({
  service: Type.String(),
  date: Type.String(),
  title: Type.String(),
  description: Type.String(),
  weight: Type.Number(),
});
