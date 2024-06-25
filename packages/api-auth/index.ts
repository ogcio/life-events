import { createRemoteJWKSet, jwtVerify } from "jose";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";

type ExtractedUserData = {
  userId: string;
  organizationId?: string;
};

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

const isScopeMatching = (permission: string[], scope: string[]): boolean => {
  if (
    permission.length === scope.length &&
    permission.every((p, i) => p === scope[i])
  ) {
    return true;
  }

  if (scope[scope.length - 1] === "*") {
    const subScope = scope.slice(0, -1);
    return (
      permission.length >= subScope.length &&
      subScope.every((s, i) => s === permission[i])
    );
  }

  return false;
};

export const validateScopes = (
  permission: string[],
  scopes: string[][],
): boolean => scopes.some((scope) => isScopeMatching(permission, scope));

export const checkPermissions = async (
  authHeader: string,
  config: {
    jwkEndpoint: string;
    oidcEndpoint: string;
    currentApiResourceIndicator: string;
  },
  requiredPermissions: string[],
): Promise<ExtractedUserData> => {
  const token = extractBearerToken(authHeader);
  const payload = await decodeLogtoToken(token, config);
  const { scope, sub, aud } = payload as {
    scope: string;
    sub: string;
    aud: string;
  };

  const permissions = requiredPermissions.map((p) => p.split(":"));
  const scopeParts = scope.split(" ").map((s) => s.split(":"));

  const scopesValidated = permissions.map((permission) =>
    validateScopes(permission, scopeParts),
  );
  if (scopesValidated.some((s) => !s)) {
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
    async (req: FastifyRequest, rep: FastifyReply, permissions: string[]) => {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        rep.status(401).send({ message: "Unauthorized" });
        return;
      }
      try {
        const userData = await checkPermissions(authHeader, opts, permissions);
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
