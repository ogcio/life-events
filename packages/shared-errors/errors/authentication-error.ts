import { LifeEventsError } from "./life-events-error.js";

export class AuthenticationError extends LifeEventsError {
  readonly errorCode: number = 401;
  constructor(errorProcess: string, message: string = "Not Authenticated") {
    super(errorProcess, message);
    this.name = "AUTHENTICATION_ERROR";
  }
}
