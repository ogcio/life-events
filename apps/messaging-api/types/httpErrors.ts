import { Type } from "@sinclair/typebox";

export const HttpError = Type.Object({
  code: Type.String({ description: "Code used to categorize the error" }),
  detail: Type.String({ description: "Description of the error" }),
  request_id: Type.String({
    description:
      "Unique request id. This one will be used to troubleshoot the problems",
  }),
  name: Type.String({ description: "Name of the error type" }),
  validation: Type.Optional(
    Type.Array(
      Type.Object({ fieldName: Type.String(), message: Type.String() }),
      { description: "List of the validation errors" },
    ),
  ),
  validationContext: Type.Optional(Type.String()),
});
