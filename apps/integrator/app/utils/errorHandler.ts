import { redirect, RedirectType } from "next/navigation";
import { validationFormatters } from "./validationMaps";

export enum ValidationErrorTypes {
  REQUIRED = "required",
  INVALID = "invalid",
  MINIMUM = "minimum",
  MAXIMUM = "maximum",
}

export type ValidationFieldMap = Record<
  string,
  {
    field: string;
    errorMessage: { [key in ValidationErrorTypes]?: string };
    formatter?: Record<string, string>;
  }
>;

export const getValidationErrors = (
  validations: any[],
  fieldMap: ValidationFieldMap,
): Record<string, string> => {
  return validations.reduce((errors, validation) => {
    const errorField = validation.additionalInfo.field ?? validation.fieldName;
    const field = fieldMap[errorField]?.field ?? errorField;

    // The first validation message is the most relevant
    if (errors[field]) {
      return errors;
    }

    const message =
      fieldMap[errorField]?.errorMessage[validation.validationRule] ??
      validation.message;

    const regExp = /@\w+@/g;

    const processedMessage = message.replaceAll(regExp, function (match) {
      const variableName = match.slice(1, -1);

      if (!validation.additionalInfo[variableName]) {
        return match;
      }

      const value = validation.additionalInfo[variableName];
      const formatterFn = fieldMap[errorField]?.formatter?.[variableName] ?? "";

      if (validationFormatters[formatterFn]) {
        return validationFormatters[formatterFn](
          value,
          validation.validationRule,
        );
      }
      return value;
    });

    errors[field] = processedMessage;

    return errors;
  }, {});
};

export const errorHandler = (error, fieldMap: ValidationFieldMap = {}) => {
  if (!error) {
    return;
  }

  if (error.validation) {
    return getValidationErrors(error.validation, fieldMap);
  }

  if (error.name === "NotFoundError") {
    return redirect("/not-found", RedirectType.replace);
  }

  // Fallback to Error page
  console.error(error);
  return redirect("/error", RedirectType.replace);
};
