import { Static } from "@sinclair/typebox";
import { ResponseMetadataSchema } from "../routes/schemas";

export type GenericResponse<T> = {
  data: T;
  metadata?: Static<typeof ResponseMetadataSchema>;
};
