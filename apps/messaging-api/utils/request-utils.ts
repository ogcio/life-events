import { FastifyRequest } from "fastify";
import { BadRequestError } from "shared-errors";

export const getOrganisationIdFromRequest = (
  request: FastifyRequest,
  errorProcess: string,
): string => {
  const query = request.query as { organisationId?: string };
  // organisationId query parameter added to
  // make us able to test it until we won't have
  // an organisation id set into the logged in user
  const organisationId =
    request.userData?.organizationId ?? query.organisationId;
  if (!organisationId) {
    throw new BadRequestError(
      errorProcess,
      "Cannot retrieve an organisation id",
    );
  }

  return organisationId;
};
