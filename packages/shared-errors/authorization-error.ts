import { LifeEventsError } from "./life-events-error";

export class AuthorizationError extends LifeEventsError {
  readonly errorCode: number = 403;
  errorProcess: string;
  constructor(errorProcess: string, message: string = "Not Authenticated") {
    super(errorProcess, message);
    this.name = "AUTHORIZATION_ERROR";
  }
}
