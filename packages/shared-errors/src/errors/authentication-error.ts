import { LifeEventsError } from "./life-events-error.js";

export class AuthenticationError extends LifeEventsError {
  readonly errorCode: number = 401;
  constructor(
    errorProcess: string,
    message: string = "Not Authenticated",
    parentError?: unknown,
  ) {
    super(errorProcess, message, parentError);
    this.name = "AUTHENTICATION_ERROR";
  }
}
