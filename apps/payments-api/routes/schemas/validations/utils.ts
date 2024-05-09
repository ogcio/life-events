export enum ValidationKeywords {
  INVALID = "invalid",
}

export const getValidationPayload = (
  keyword: ValidationKeywords,
  message: string,
  params: Record<string, unknown>,
) => {
  return {
    keyword,
    message,
    params,
  };
};

export const getValidationError = (
  statusCode: number,
  message: string,
  name: string,
  validations: Array<Record<string, unknown>>,
) => {
  return {
    statusCode,
    message,
    name,
    validation: validations,
  };
};
