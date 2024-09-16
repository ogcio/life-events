import { LifeEventsError } from "./life-events-error.js";

export class ThirdPartyError extends LifeEventsError {
  readonly errorCode: number = 502;
  constructor(errorProcess: string, message: string, parentError?: unknown) {
    super(errorProcess, message, parentError);
    this.name = "THIRD_PARTY_ERROR";
  }
}
