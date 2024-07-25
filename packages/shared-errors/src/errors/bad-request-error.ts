import { LifeEventsError } from "./life-events-error.js";

export class BadRequestError extends LifeEventsError {
  readonly errorCode: number = 400;

  constructor(errorProcess: string, message: string, parentError?: unknown) {
    super(errorProcess, message, parentError);
    this.name = "BAD_REQUEST_ERROR";
  }
}
