import ibanValidator from "./iban";

export type ValidatorFn = (
  value: any,
  field: string,
  errors: Array<any>,
) => boolean;

const validators: Record<string, ValidatorFn> = {
  IBANValidator: ibanValidator,
};

export default function validator(
  value: any,
  validatorFn: string,
  field: string,
  errors: Array<any>,
): boolean {
  if (!validators[validatorFn]) {
    const err = new Error(`Validator not found: ${validatorFn}`);
    throw err;
  }

  return validators[validatorFn](value, field, errors);
}
