import { FastifyError } from "fastify";
import { isNativeError } from "util/types";
import { isHttpError } from "http-errors";

export const getErrorMessage = (e: unknown): string => {
  if (isNativeError(e) || isHttpError(e) || isFastifyError(e)) {
    return e.message;
  }
  switch (typeof e) {
    case "string":
      return e;
    case "bigint":
    case "number":
    case "boolean":
      return String(e);
    case "object":
      if (e && "message" in e && typeof e.message === "string") {
        return e.message;
      }
      return e ? e.toString() : "";
    default:
      return "";
  }
};

const isFastifyError = (e: unknown): e is FastifyError =>
  typeof e === "object" &&
  e !== null &&
  "code" in e &&
  "name" in e &&
  "message" in e;
