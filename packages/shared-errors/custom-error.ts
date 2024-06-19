import { LifeEventsError } from "./life-events-error";

// To use when already implemented errors are not enough
export class CustomError extends LifeEventsError {
  errorCode: number;
  errorProcess: string;

  constructor(
    errorProcess: string,
    message: string,
    errorCode: number,
    errorName: "CUSTOM_ERROR",
  ) {
    super(errorProcess, message);
    this.name = errorName;
    this.errorCode = errorCode;
  }
}
