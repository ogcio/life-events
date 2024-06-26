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
