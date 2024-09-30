import { ValidatorFn } from ".";
import routes from "../../..";
import requiredValidator from "./required";

type SupportedOperations = "equal" | "notEqual";
const operationMap = {
  equal: (a: unknown, b: unknown) => a === b,
  notEqual: (a: unknown, b: unknown) => a !== b,
};

const validate: ValidatorFn = (value, field, rootData, errors, options) => {
  const fieldValue = rootData[options.field];

  if (!operationMap[options.operation as SupportedOperations]) {
    throw new Error("Unsupported operation");
  }

  const operation = operationMap[options.operation as SupportedOperations];

  const isRequired = operation(fieldValue, options.value);

  if (!isRequired) {
    return true;
  }

  return requiredValidator(value, field, routes, errors);
};

export default validate;
