import { LifeEventsError } from "./life-events-error";

export class ValidationError extends LifeEventsError {
  readonly errorCode: number = 422;
  validationErrors: { [fieldName: string]: string };
  errorProcess: string;

  constructor(
    errorProcess: string,
    message: string,
    validationErrors: { [fieldName: string]: string },
  ) {
    super(errorProcess, message);
    this.name = "VALIDATION_ERROR";
    this.validationErrors = validationErrors;
  }
}
