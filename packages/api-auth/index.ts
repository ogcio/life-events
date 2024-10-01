import { createRemoteJWKSet, jwtVerify } from "jose";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import { getMapFromScope, validatePermission } from "./utils.js";
import { getErrorMessage } from "@ogcio/shared-errors";
import { httpErrors } from "@fastify/sensible";

type ExtractedUserData = {
  userId: string;
  organizationId?: string;
  isM2MApplication: boolean;
  accessToken: string;
};

type MatchConfig = { method: "AND" | "OR" };

declare module "fastify" {
  interface FastifyRequest {
    userData?: ExtractedUserData;
  }
}

const extractBearerToken = (authHeader: string) => {
  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer") {
    throw httpErrors.unauthorized(
      "Invalid Authorization header type, 'Bearer' expected",
    );
  }
  return token;
};

const decodeLogtoToken = async (
  token: string,
  config: {
    jwkEndpoint: string;
    oidcEndpoint: string;
    currentApiResourceIndicator: string;
  },
) => {
  // Reference: https://docs.logto.io/docs/recipes/protect-your-api/node/
  const jwks = createRemoteJWKSet(new URL(config.jwkEndpoint));
  const { payload } = await jwtVerify(token, jwks, {
    issuer: config.oidcEndpoint,
  });
  return payload;
};

export const ensureUserCanAccessUser = (
  loggedUserData: ExtractedUserData | undefined,
  requestedUserId: string,
  errorProcess: string,
): ExtractedUserData => {
  if (loggedUserData && requestedUserId === loggedUserData.userId) {
    return loggedUserData;
  }

  if (loggedUserData && loggedUserData.organizationId) {
    return loggedUserData;
  }

  throw httpErrors.forbidden("You can't access this user's data");
};

export const checkPermissions = async (
  authHeader: string,
  config: {
    jwkEndpoint: string;
    oidcEndpoint: string;
    currentApiResourceIndicator: string;
  },
  requiredPermissions: string[],
  matchConfig = { method: "OR" },
): Promise<ExtractedUserData> => {
  const token = extractBearerToken(authHeader);
  const payload = await decodeLogtoToken(token, config);
  const {
    scope,
    sub,
    aud,
    client_id: clientId,
  } = payload as {
    scope: string;
    sub: string;
    aud: string;
    client_id: string;
  };
  const scopesMap = getMapFromScope(scope);

  const grantAccess =
    matchConfig.method === "AND"
      ? requiredPermissions.every((p) => validatePermission(p, scopesMap))
      : requiredPermissions.some((p) => validatePermission(p, scopesMap));

  if (!grantAccess) {
    throw httpErrors.forbidden();
  }

  const organizationId = aud.includes("urn:logto:organization:")
    ? aud.split("urn:logto:organization:")[1]
    : undefined;

  return {
    userId: sub,
    organizationId: organizationId,
    accessToken: token,
    isM2MApplication: sub === clientId,
  };
};

export type CheckPermissionsPluginOpts = {
  jwkEndpoint: string;
  oidcEndpoint: string;
  currentApiResourceIndicator: string;
};

export const checkPermissionsPlugin = async (
  app: FastifyInstance,
  opts: CheckPermissionsPluginOpts,
) => {
  app.decorate(
    "checkPermissions",
    async (
      req: FastifyRequest,
      rep: FastifyReply,
      permissions: string[],
      matchConfig?: MatchConfig,
    ) => {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw httpErrors.unauthorized();
      }
      try {
        const userData = await checkPermissions(
          authHeader,
          opts,
          permissions,
          matchConfig,
        );
        req.userData = userData;
      } catch (e) {
        throw httpErrors.createError(403, getErrorMessage(e), { parent: e });
      }
    },
  );
};

export default fp(checkPermissionsPlugin, {
  name: "apiAuthPlugin",
});

export * from "./logto-client/index.js";
