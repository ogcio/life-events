import {
  SignJWT,
  jwtVerify,
  createRemoteJWKSet,
  exportJWK,
  importPKCS8,
  KeyLike,
  JWTVerifyOptions,
  JWTPayload,
  JWK,
} from "jose";
import { createPublicKey, generateKeyPairSync } from "crypto";
import fs from "fs/promises";

const defaultAlgorithm = "RS256";

// A simple in-memory store to simulate key storage
const keyStore: { [key: string]: { publicKey: JWK; privateKey: JWK } } = {};

/**
 * Reads or generates a public-private key pair for the given serviceName.
 * If the key pair already exists, it retrieves it. Otherwise, it generates a new pair.
 * @param serviceName - The name of the service to generate or retrieve the key pair for.
 */

// This can be used for local development and testing
// In remote environments we will need to use KMS
async function readOrGenerateKeyPair(
  serviceName: string,
): Promise<{ publicKey: JWK; privateKey: JWK }> {
  // Check if the key pair already exists in memory (could be on disk instead)
  if (keyStore[serviceName]) {
    return keyStore[serviceName];
  }

  // If not found, generate a new key pair
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  // Convert the public and private keys into JWK format
  const publicKeyJWK = await exportJWK(createPublicKey(publicKey));
  const privateKeyJWK = await exportJWK(await importPKCS8(privateKey, "RS256"));

  // Store the generated key pair in memory
  keyStore[serviceName] = {
    publicKey: publicKeyJWK,
    privateKey: privateKeyJWK,
  };

  // Return the newly generated key pair
  return keyStore[serviceName];
}

interface JWTOptions {
  algorithm?: string; // Algorithm used for signing the token
  expirationTime?: string; // Token expiration time (e.g., "1h")
  audience?: string; // Expected audience
  issuer?: string; // Token issuer
}

/**
 * Creates and signs a JWT using the provided payload and private key.
 * @param payload - The JWT payload as an object.
 * @param privateKey - The private key to sign the token with.
 * @param options - Optional parameters for customizing the JWT creation (e.g., expiration, audience, issuer).
 */
async function createSignedJWT(
  payload: Record<string, unknown>,
  privateKey: JWK,
  options: JWTOptions = {},
) {
  const {
    algorithm = defaultAlgorithm,
    expirationTime = "2h",
    audience,
    issuer,
  } = options;

  const jwt = new SignJWT(payload)
    .setProtectedHeader({ alg: algorithm })
    .setIssuedAt()
    .setExpirationTime(expirationTime);

  if (audience) {
    jwt.setAudience(audience);
  }

  if (issuer) {
    jwt.setIssuer(issuer);
  }
  return jwt.sign(privateKey);
}

/**
 * Returns the JWKS (JSON Web Key Set) for the public key.
 */
async function getJWKSRoute(publicKey: JWK) {
  return { keys: [publicKey] };
}

interface VerifyJWTOptions {
  jwksUrl: string;
  audience?: string; // Expected audience for the token
  issuer?: string; // Expected issuer for the token
  algorithm?: string; // Algorithm used for signing the token
}

/**
 * Verifies the given JWT using the JWKS provided by the remote JWKS URL.
 * @param token - The JWT token to verify.
 * @param options - Object containing JWKS URL, expected audience, issuer, and algorithm.
 */
async function verifyJWT(
  token: string,
  options: VerifyJWTOptions,
): Promise<JWTPayload> {
  const { jwksUrl, audience, issuer, algorithm = defaultAlgorithm } = options;

  // Create the remote JWK set from the given URL
  const JWKS = createRemoteJWKSet(new URL(jwksUrl));

  // Define verification options
  const verifyOptions: JWTVerifyOptions = {
    algorithms: [algorithm],
    audience, // Check if token is for the expected audience
    issuer, // Check if token was issued by the expected issuer
  };

  // Verify the JWT using the remote JWKS
  const { payload } = await jwtVerify(token, JWKS, verifyOptions);

  // Check if the token has expired by verifying the `exp` claim
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    throw new Error("Token has expired");
  }

  return payload;
}
export { createSignedJWT, getJWKSRoute, verifyJWT, readOrGenerateKeyPair };
