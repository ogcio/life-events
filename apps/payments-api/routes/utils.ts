import {
  getValidationError,
  getValidationPayload,
  ValidationKeywords,
} from "./schemas/validations/utils";

export enum DbErrors {
  DuplicatedKey = "23505",
}

export type DbConstraintMap = Record<
  string,
  { field: string; message: string }
>;

export const handleDbError = (
  err: unknown,
  dbConstraintMap: DbConstraintMap,
) => {
  if ((err as any).code === DbErrors.DuplicatedKey) {
    const constrainName = (err as any).constraint;
    const constrainDetails = dbConstraintMap[constrainName];

    const error = getValidationError((err as Error).message, "Duplicated key", [
      getValidationPayload(
        ValidationKeywords.INVALID,
        constrainDetails?.message ?? (err as Error).message,
        {
          field: constrainDetails?.field,
        },
      ),
    ]);

    throw error;
  }

  // Fallback to original error
  throw err;
};
