import { FastifyRequest } from "fastify";
import { createRemoteJWKSet, jwtVerify } from "jose";

const extractBearerTokenFromHeaders = (request: FastifyRequest) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new Error("No Authorization header found");
  }

  return authHeader.slice(7);
};

// Generate a JWKS using jwks_uri obtained from the Logto server
const jwks = createRemoteJWKSet(new URL("http://localhost:3301/oidc/jwks"));

export const auth = async (req: FastifyRequest) => {
  // Extract the token using the helper function defined above
  const token = extractBearerTokenFromHeaders(req);
  console.log(token);
  const { payload } = await jwtVerify(
    // The raw Bearer Token extracted from the request header
    token,
    jwks,
    {
      // Expected issuer of the token, issued by the Logto server
      issuer: "http://localhost:3301/oidc",
      // Expected audience token, the resource indicator of the current API
      audience: "http://localhost:8001",
    },
  );

  // Sub is the user ID, used for user identification
  const { scope, sub } = payload;

  console.log(payload);
};
