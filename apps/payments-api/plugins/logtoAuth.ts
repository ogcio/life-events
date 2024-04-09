import { FastifyRequest } from "fastify";
import { createRemoteJWKSet, jwtVerify } from "jose";

const extractBearerTokenFromHeaders = (request: FastifyRequest) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new Error("No Authorization header found");
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2) {
    throw new Error("Invalid Authorization header format");
  }

  const scheme = parts[0];
  const token = parts[1];

  if (!/^Bearer$/i.test(scheme)) {
    throw new Error("Authorization header is not of type Bearer");
  }

  return token;
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

  console.log(scope, sub);
};
