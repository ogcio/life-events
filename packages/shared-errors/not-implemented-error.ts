import { LifeEventsError } from "./life-events-error";

export class NotImplementedError extends LifeEventsError {
  readonly errorCode: number = 500;
  errorProcess: string;
  constructor(errorProcess: string, message: string) {
    super(errorProcess, message);
    this.name = "NOT_IMPLEMENTED_ERROR";
  }
}
