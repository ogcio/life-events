import { LifeEventsError } from "./life-events-error";

export class ThirdPartyError extends LifeEventsError {
  readonly errorCode: number = 502;
  errorProcess: string;
  constructor(errorProcess: string, message: string) {
    super(errorProcess, message);
    this.name = "THIRD_PARTY_ERROR";
  }
}
