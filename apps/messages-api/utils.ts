import { OurHttpError } from "./tmp_utils";

export const apiError = (
  message: string,
  statusCode: number,
): OurHttpError => ({
  message,
  statusCode,
});
