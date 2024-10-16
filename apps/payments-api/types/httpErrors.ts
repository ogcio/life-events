import { Type } from "@sinclair/typebox";

export const HttpError = Type.Object({
  code: Type.String(),
  detail: Type.String(),
  requestId: Type.String(),
  name: Type.String(),
  validation: Type.Optional(Type.Any()),
  validationContext: Type.Optional(Type.String()),
});
