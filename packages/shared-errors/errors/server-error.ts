import { LifeEventsError } from "./life-events-error.js";

export class ServerError extends LifeEventsError {
  readonly errorCode: number = 500;
  constructor(errorProcess: string, message: string) {
    super(errorProcess, message);
    this.name = "SERVER_ERROR";
  }
}
