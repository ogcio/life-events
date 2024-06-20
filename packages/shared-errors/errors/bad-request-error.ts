import { LifeEventsError } from "./life-events-error.js";

export class BadRequest extends LifeEventsError {
  readonly errorCode: number = 400;

  constructor(errorProcess: string, message: string) {
    super(errorProcess, message);
    this.name = "BAD_REQUEST_ERROR";
  }
}
