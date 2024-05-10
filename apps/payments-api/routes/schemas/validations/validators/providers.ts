import { ValidatorFn } from ".";
import {
  mapProviderData,
  ProviderDataErrors,
} from "../../../../plugins/entities/providers/dataMapper";

const validate: ValidatorFn = (value, field, rootData, errors) => {
  const providerType = rootData.type;
  const [mappedValue, mappingErrors] = mapProviderData(value, providerType);

  if (mappingErrors.length) {
    mappingErrors.forEach((err) => {
      errors.push({
        keyword: "invalid",
        message:
          err.error === ProviderDataErrors.INVALID
            ? `Field ${err.field} is invalid.`
            : `Field ${err.field} is missing.`,
        params: {
          field: err.field,
        },
      });
    });
  }

  return !mappingErrors.length;
};

export default validate;
