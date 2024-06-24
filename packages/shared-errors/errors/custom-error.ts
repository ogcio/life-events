import { LifeEventsError } from "./life-events-error.js";

// To use when already implemented errors are not enough
export class CustomError extends LifeEventsError {
  errorCode: number;

  constructor(
    errorProcess: string,
    message: string,
    errorCode: number,
    errorName: string = "CUSTOM_ERROR",
  ) {
    super(errorProcess, message);
    this.name = errorName;
    this.errorCode = errorCode;
  }
}
