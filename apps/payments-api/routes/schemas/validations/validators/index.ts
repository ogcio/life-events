import paymentRequestStatusValidator from "./paymentRequestStatus";
import providersValidator from "./providers";
import requiredValidator from "./required";
import optionalRequired from "./optionalRequired";

export type ValidatorFn = (
  value: any,
  field: string,
  rootData: any,
  errors: Array<any>,
  options?: any,
) => boolean;

export enum ErrorTypes {
  REQUIRED = "required",
  INVALID = "invalid",
}

const validators: Record<string, ValidatorFn> = {
  ProvidersValidator: providersValidator,
  RequiredValidator: requiredValidator,
  PaymentRequestStatusValidator: paymentRequestStatusValidator,
  OptionalRequiredValidator: optionalRequired,
};

export default function validatorEngine(
  value: any,
  validator: string | { name: string; options: any },
  field: string,
  rootData: any,
  errors: Array<any>,
): boolean {
  const [validatorFn, options] =
    typeof validator === "string"
      ? [validator, undefined]
      : [validator.name, validator.options];

  if (!validators[validatorFn]) {
    const err = new Error(`Validator not found: ${validator}`);
    throw err;
  }

  return validators[validatorFn](value, field, rootData, errors, options);
}
