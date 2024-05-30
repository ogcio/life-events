import { ErrorTypes, ValidatorFn } from ".";

const validate: ValidatorFn = (value, field, rootData, errors) => {
  const invalid = value === "active" && rootData.providers?.length === 0;

  if (invalid) {
    errors.push({
      keyword: ErrorTypes.INVALID,
      message: `Field ${field} is invalid.`,
      params: {
        field: field,
      },
    });
  }

  return !invalid;
};

export default validate;
