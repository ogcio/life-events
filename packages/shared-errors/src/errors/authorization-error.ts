import { LifeEventsError } from "./life-events-error.js";

export class AuthorizationError extends LifeEventsError {
  readonly errorCode: number = 403;
  constructor(
    errorProcess: string,
    message: string = "Not Authorized",
    parentError?: unknown,
  ) {
    super(errorProcess, message, parentError);
    this.name = "AUTHORIZATION_ERROR";
  }
}
