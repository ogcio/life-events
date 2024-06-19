import { LifeEventsError } from "./life-events-error.js";

export class AuthorizationError extends LifeEventsError {
  readonly errorCode: number = 403;
  constructor(errorProcess: string, message: string = "Not Authenticated") {
    super(errorProcess, message);
    this.name = "AUTHORIZATION_ERROR";
  }
}
