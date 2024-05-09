import { FastifyBaseLogger } from "fastify";
import {
  getValidationError,
  getValidationPayload,
  ValidationKeywords,
} from "./schemas/validations/utils";

export enum DbErrors {
  DuplicatedKey = "23505",
}

export type DbConstrainMap = Record<string, { field: string; message: string }>;

export const handleDbError = (err: unknown, dbConstrainMap: DbConstrainMap) => {
  if ((err as any).code === DbErrors.DuplicatedKey) {
    const constrainName = (err as any).constraint;
    const constrainDetails = dbConstrainMap[constrainName];

    const error = getValidationError(
      422,
      (err as Error).message,
      "Duplicated key",
      [
        getValidationPayload(
          ValidationKeywords.INVALID,
          constrainDetails?.message ?? (err as Error).message,
          {
            field: constrainDetails?.field,
          },
        ),
      ],
    );

    throw error;
  }

  // Fallback to original error
  throw err;
};
