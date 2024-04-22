import { createRemoteJWKSet, jwtVerify } from "jose";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

const extractBearerToken = (authHeader: string) => {
  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer") {
    throw new Error("Invalid Authorization header type");
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
    // Expected issuer of the token, issued by the Logto server
    issuer: config.oidcEndpoint,
    // Expected audience token, the resource indicator of the current API
    audience: config.currentApiResourceIndicator,
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
) => {
  const token = extractBearerToken(authHeader);
  const payload = await decodeLogtoToken(token, config);

  const { scope, sub } = payload as { scope: string; sub: string };
  for (const permission of requiredPermissions) {
    if (!scope.includes(permission)) {
      throw new Error("Forbidden");
    }
  }

  return { id: sub };
};

export type CheckPermissionsPluginOpts = {
  jwkEndpoint: string;
  oidcEndpoint: string;
  currentApiResourceIndicator: string;
};

export const checkPermissionsPlugin = (
  app: FastifyInstance,
  opts: CheckPermissionsPluginOpts,
  done: any,
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
        await checkPermissions(authHeader, opts, permissions);
      } catch (e) {
        rep.status(403).send({ message: (e as Error).message });
      }
    },
  );
  done();
};
