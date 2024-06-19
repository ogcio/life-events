import { LifeEventsError } from "./life-events-error";

export class ServerError extends LifeEventsError {
  readonly errorCode: number = 500;
  constructor(errorProcess: string, message: string) {
    super(errorProcess, message);
    this.name = "SERVER_ERROR";
  }
}
