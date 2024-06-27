import { Type } from "@sinclair/typebox";

export const HttpError = Type.Object({
  code: Type.String(),
  detail: Type.String(),
  request_id: Type.String(),
  name: Type.String(),
  validation: Type.Optional(
    Type.Array(
      Type.Object({ fieldName: Type.String(), message: Type.String() }),
    ),
  ),
  validationContext: Type.Optional(Type.String()),
});
