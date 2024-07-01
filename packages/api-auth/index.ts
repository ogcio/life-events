import { createRemoteJWKSet, jwtVerify } from "jose";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import { getMapFromScope, validatePermission } from "./utils.js";

type ExtractedUserData = {
  userId: string;
  organizationId?: string;
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
    throw new Error("Invalid Authorization header type, 'Bearer' expected");
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

export const checkPermissions = async (
  authHeader: string,
  config: {
    jwkEndpoint: string;
    oidcEndpoint: string;
    currentApiResourceIndicator: string;
  },
  requiredPermissions: string[],
  matchConfig = { method: "AND" },
): Promise<ExtractedUserData> => {
  const token = extractBearerToken(authHeader);
  const payload = await decodeLogtoToken(token, config);
  const { scope, sub, aud } = payload as {
    scope: string;
    sub: string;
    aud: string;
  };

  const scopesMap = getMapFromScope(scope);

  const grantAccess =
    matchConfig.method === "AND"
      ? requiredPermissions.every((p) => validatePermission(p, scopesMap))
      : requiredPermissions.some((p) => validatePermission(p, scopesMap));

  if (!grantAccess) {
    throw new Error("Forbidden");
  }

  const organizationId = aud.includes("urn:logto:organization:")
    ? aud.split("urn:logto:organization:")[1]
    : undefined;
  return {
    userId: sub,
    organizationId: organizationId,
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
        rep.status(401).send({ message: "Unauthorized" });
        return;
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
        rep.status(403).send({ message: (e as Error).message });
      }
    },
  );
};

export default fp(checkPermissionsPlugin, {
  name: "apiAuthPlugin",
});
