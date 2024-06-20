import { LifeEventsError } from "./life-events-error.js";

export class ValidationError extends LifeEventsError {
  readonly errorCode: number = 422;
  validationErrors: { [fieldName: string]: string };

  constructor(
    errorProcess: string,
    message: string,
    validationErrors: { [fieldName: string]: string } = {},
  ) {
    super(errorProcess, message);
    this.name = "VALIDATION_ERROR";
    this.validationErrors = validationErrors;
  }
}

export const isValidationLifeEventsError = (
  error: unknown,
): error is ValidationError => {
  return (
    typeof error === "object" &&
    (error as LifeEventsError).errorProcess !== undefined &&
    (error as ValidationError).validationErrors !== undefined
  );
};
