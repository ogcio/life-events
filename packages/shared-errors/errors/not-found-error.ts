import { LifeEventsError } from "./life-events-error.js";

export class NotFoundError extends LifeEventsError {
  readonly errorCode: number = 404;
  constructor(errorProcess: string, message: string = "Not Found") {
    super(errorProcess, message);
    this.name = "NOT_FOUND_ERROR";
  }
}
