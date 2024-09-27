import { FastifyError } from "fastify";
import { isNativeError } from "util/types";
import { isHttpError } from "http-errors";
import { httpErrors } from "@fastify/sensible";
export const getErrorMessage = (e: unknown): string => {
  if (isNativeError(e) || isHttpError(e) || isFastifyError(e)) {
    return e.message;
  }
  switch (typeof e) {
    case "string":
      return e;
    case "bigint":
    case "number":
    case "boolean":
      return String(e);
    case "object":
      if (e && "message" in e && typeof e.message === "string") {
        return e.message;
      }
      return e ? e.toString() : "";
    default:
      return "";
  }
};

const isFastifyError = (e: unknown): e is FastifyError =>
  typeof e === "object" &&
  e !== null &&
  "code" in e &&
  "name" in e &&
  "message" in e;

export const ensureUserIsOrganisationMember = (
  user: { organizationId?: string } | undefined,
): string => {
  if (!user?.organizationId) {
    throw httpErrors.unauthorized(
      "You have to be part of an organisation to invoke this endpoint",
    );
  }

  return user.organizationId;
};
