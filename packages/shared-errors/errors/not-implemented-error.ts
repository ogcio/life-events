import { LifeEventsError } from "./life-events-error.js";

export class NotImplementedError extends LifeEventsError {
  readonly errorCode: number = 500;
  constructor(errorProcess: string, message: string) {
    super(errorProcess, message);
    this.name = "NOT_IMPLEMENTED_ERROR";
  }
}
