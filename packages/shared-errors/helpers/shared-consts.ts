import { isLifeEventsError } from "shared-errors";
import { isNativeError } from "util/types";

export enum HttpErrorClasses {
  ServerError = "SERVER_ERROR",
  ValidationError = "VALIDATION_ERROR",
  RequestError = "REQUEST_ERROR",
  GatewayError = "GATEWAY_ERROR",
  UnknownError = "UNKNOWN_ERROR",
  NotFoundError = "NOT_FOUND_ERROR",
}

export const parseHttpErrorClass = (
  errorCode: number | undefined,
): HttpErrorClasses => {
  if (!errorCode) {
    return HttpErrorClasses.UnknownError;
  }

  if (errorCode === 502) {
    return HttpErrorClasses.GatewayError;
  }

  if (errorCode >= 500) {
    return HttpErrorClasses.ServerError;
  }

  if (errorCode === 404) {
    return HttpErrorClasses.NotFoundError;
  }

  if (errorCode === 422) {
    return HttpErrorClasses.ValidationError;
  }

  if (errorCode >= 400) {
    return HttpErrorClasses.RequestError;
  }

  return HttpErrorClasses.UnknownError;
};

export const REQUEST_ID_HEADER = "x-life-events-request-id";

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
      if (e && "message" in e && typeof e.message === "string") {
        return e.message;
      }
      return e ? e.toString() : "";
    default:
      return "";
  }
};

const isFastifyError = (
  e: unknown,
): e is { code: string; name: string; statusCode?: number; message: string } =>
  typeof e === "object" &&
  e !== null &&
  "code" in e &&
  "name" in e &&
  "message" in e;
