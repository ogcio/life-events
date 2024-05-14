import providersValidator from "./providers";

export type ValidatorFn = (
  value: any,
  field: string,
  rootData: any,
  errors: Array<any>,
) => boolean;

const validators: Record<string, ValidatorFn> = {
  ProvidersValidator: providersValidator,
};

export default function validator(
  value: any,
  validatorFn: string,
  field: string,
  rootData: any,
  errors: Array<any>,
): boolean {
  if (!validators[validatorFn]) {
    const err = new Error(`Validator not found: ${validatorFn}`);
    throw err;
  }

  return validators[validatorFn](value, field, rootData, errors);
}
