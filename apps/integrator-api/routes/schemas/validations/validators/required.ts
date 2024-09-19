import { ErrorTypes, ValidatorFn } from ".";

const validate: ValidatorFn = (value, field, rootData, errors) => {
  let valid = true;

  if (typeof value === "number" && Number.isNaN(value)) {
    valid = false;
  } else if (typeof value === "string" && value === "") {
    valid = false;
  } else if (value === null || value === undefined) {
    valid = false;
  }

  if (!valid) {
    errors.push({
      keyword: ErrorTypes.REQUIRED,
      message: `Field ${field} is required.`,
      params: {
        field,
      },
    });
  }

  return valid;
};

export default validate;
