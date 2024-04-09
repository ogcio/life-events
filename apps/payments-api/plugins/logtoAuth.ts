import { FastifyReply, FastifyRequest, FastifyPluginAsync } from "fastify";
import { createRemoteJWKSet, jwtVerify } from "jose";
import fp from "fastify-plugin";

const extractBearerTokenFromHeaders = (request: FastifyRequest) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new Error("No Authorization header found");
  }

  return authHeader.slice(7);
};

// Generate a JWKS using jwks_uri obtained from the Logto server
const jwks = createRemoteJWKSet(new URL("http://localhost:3301/oidc/jwks"));

const checkPermission = async (
  req: FastifyRequest,
  rep: FastifyReply,
  requiredPermissions: Permission[],
) => {
  try {
    const token = extractBearerTokenFromHeaders(req);
    console.log(token);
    const { payload } = await jwtVerify(token, jwks, {
      // Expected issuer of the token, issued by the Logto server
      issuer: "http://localhost:3301/oidc",
      // Expected audience token, the resource indicator of the current API
      audience: "http://localhost:8001",
    });

    // Sub is the user ID, used for user identification
    const { scope, sub } = payload as { scope: string; sub: string };

    for (const permission of requiredPermissions) {
      if (!scope.includes(permission)) {
        rep.code(403).send({ message: "Forbidden" });
        return;
      }
    }

    req.user = { id: sub };
  } catch (e) {
    console.error(e);
    rep.code(401).send({ message: "Unauthorized" });
  }
};

export const permissions = {
  READ_PAYMENT: "payments:read",
  WRITE_PAYMENT: "payments:write",
} as const;

export type Permission = (typeof permissions)[keyof typeof permissions];

const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate("checkPermission", checkPermission);
};

export default fp(authPlugin, {
  name: "logtoAuthPlugin",
});
