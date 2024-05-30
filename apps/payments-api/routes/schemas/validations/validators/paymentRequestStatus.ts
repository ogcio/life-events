import { ErrorTypes, ValidatorFn } from ".";

const validate: ValidatorFn = (value, field, rootData, errors) => {
  console.log(rootData);
  const inValid = value === "active" && rootData.providers?.length === 0;

  if (inValid) {
    errors.push({
      keyword: ErrorTypes.INVALID,
      message: `Field ${field} is invalid.`,
      params: {
        field: field,
      },
    });
  }

  return !inValid;
};

export default validate;
