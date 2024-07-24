import { LifeEventsError } from "./life-events-error.js";

export class NotFoundError extends LifeEventsError {
  readonly errorCode: number = 404;
  constructor(
    errorProcess: string,
    message: string = "Not Found",
    parentError?: unknown,
  ) {
    super(errorProcess, message, parentError);
    this.name = "NOT_FOUND_ERROR";
  }
}
