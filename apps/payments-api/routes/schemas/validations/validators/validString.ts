import { ErrorTypes, ValidatorFn } from ".";

const validate: ValidatorFn = (value, field, rootData, errors) => {
  const valid = !!value;

  if (!valid) {
    errors.push({
      keyword: ErrorTypes.REQUIRED,
      message: `Field ${field} cannot be empty.`,
      params: {
        field,
      },
    });
  }

  return valid;
};

export default validate;
