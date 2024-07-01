import { LifeEventsError } from "./life-events-error.js";

export interface ValidationErrorData {
  fieldName: string;
  message: string;
  validationRule: string;
  additionalInfo?: Record<string, unknown>;
}

export class ValidationError extends LifeEventsError {
  readonly errorCode: number = 422;
  validationErrors: ValidationErrorData[];

  constructor(
    errorProcess: string,
    message: string,
    validationErrors: ValidationErrorData[] = [],
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
