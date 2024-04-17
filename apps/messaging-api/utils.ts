import { randomUUID } from "crypto";
import { OurHttpError } from "./tmp_utils";

export const buildApiError = (
  message: string,
  statusCode: number,
): OurHttpError => ({
  message,
  statusCode,
});

export const organisationId = randomUUID().toString();
