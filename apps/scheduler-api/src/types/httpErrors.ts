import { Type } from "@sinclair/typebox";

export const HttpError = Type.Object({
  statusCode: Type.Number(),
  code: Type.String(),
  error: Type.String(),
  message: Type.String(),
  time: Type.String(),
});
