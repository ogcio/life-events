import { LifeEventsError } from "./life-events-error";

export class AuthenticationError extends LifeEventsError {
  readonly errorCode: number = 401;
  errorProcess: string;
  constructor(errorProcess: string, message: string = "Not Authenticated") {
    super(errorProcess, message);
    this.name = "AUTHENTICATION_ERROR";
  }
}
