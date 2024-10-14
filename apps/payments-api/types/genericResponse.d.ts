import { ResponseMetadata } from "../routes/schemas";

export type GenericResponse<T> = {
  data: T;
  metadata?: ResponseMetadata;
};
