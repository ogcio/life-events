import { httpErrors } from "@fastify/sensible";

export const ensureUserIsOrganisationMember = (
  user: { organizationId?: string } | undefined,
): string => {
  if (!user?.organizationId) {
    throw httpErrors.forbidden(
      "You have to be part of an organisation to invoke this endpoint",
    );
  }

  return user.organizationId;
};
