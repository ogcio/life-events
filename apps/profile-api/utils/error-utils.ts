import { FastifyError } from "fastify";
import { isLifeEventsError } from "shared-errors";
import { isNativeError } from "util/types";

export const getErrorMessage = (e: unknown): string => {
  if (isNativeError(e) || isLifeEventsError(e) || isFastifyError(e)) {
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
