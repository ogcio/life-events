import {
  jwtVerify,
  createRemoteJWKSet,
  exportJWK,
  JWTVerifyOptions,
  JWTPayload,
  JWK,
  importSPKI,
  decodeJwt,
} from "jose";
import {
  GetPublicKeyCommand,
  KMSClient,
  KMSClientConfig,
  SignCommand,
} from "@aws-sdk/client-kms";

const getKmsClient = (() => {
  let kmsClient: KMSClient | null = null;

  return function getKmsClient(): KMSClient {
    if (kmsClient) return kmsClient;

    const kmsConfig: KMSClientConfig = {
      region: process.env.AWS_REGION,
      endpoint: process.env.KMS_ENDPOINT,
    };

    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      kmsConfig.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      };
    }

    kmsClient = new KMSClient(kmsConfig);
    return kmsClient;
  };
})();

const defaultAlgorithm = "RS256";

interface JWTOptions {
  expirationTime?: string; // Token expiration time (e.g., "1h")
  audience?: string; // Expected audience
  issuer?: string; // Token issuer
}

/**
 * Creates and signs a JWT using the provided payload and private key.
 * @param payload - The JWT payload as an object.
 * @param keyId - The key id or alias in KMS
 * @param options - Optional parameters for customizing the JWT creation (e.g., expiration, audience, issuer).
 */
async function createSignedJWT(
  payload: Record<string, unknown>,
  keyId: string,
  options: JWTOptions,
) {
  const { audience: aud, issuer: iss } = options;

  const header = {
    alg: defaultAlgorithm,
    typ: "JWT",
  };

  // we need to create the jwt manually and sign it directly on KMS - private keys cannot be retrieved
  const payloadString = JSON.stringify({ ...payload, aud, iss });

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
    "base64url",
  );
  const encodedPayload = Buffer.from(payloadString).toString("base64url");

  const messageToSign = `${encodedHeader}.${encodedPayload}`;

  const input = {
    KeyId: keyId,
    Message: Buffer.from(messageToSign),
    MessageType: "RAW" as const,
    SigningAlgorithm: "RSASSA_PKCS1_V1_5_SHA_256" as const,
  };
  const command = new SignCommand(input);
  const signResponse = await getKmsClient().send(command);

  if (!signResponse.Signature) {
    throw new Error("KMS did not return a signature. Signing failed.");
  }
  const signature = Buffer.from(signResponse.Signature).toString("base64url");

  return `${messageToSign}.${signature}`;
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
  const { jwksUrl, audience, issuer } = options;

  // Create the remote JWK set from the given URL
  const JWKS = createRemoteJWKSet(new URL(jwksUrl));

  // Define verification options
  const verifyOptions: JWTVerifyOptions = {
    algorithms: [defaultAlgorithm],
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

/**
 * Retrieves a public key from KMS and returns the JWKS (JSON Web Key Set) for the public key.
 * @param keyId - The key id or alias in KMS.
 */
async function getJWKS(keyId: string): Promise<{ keys: JWK[] }> {
  const command = new GetPublicKeyCommand({ KeyId: keyId });
  const { PublicKey } = await getKmsClient().send(command);

  if (!PublicKey)
    throw new Error("KMS did not return a public key. Retrieval failed.");

  // convert Uint8Array to JWK
  const spki = `-----BEGIN PUBLIC KEY-----\n${Buffer.from(PublicKey).toString("base64")}\n-----END PUBLIC KEY-----`;
  const keyObject = await importSPKI(spki, "RS256");
  const jwk = await exportJWK(keyObject);

  return getJWKSRoute(jwk);
}

// Function to decode JWT without validation
function getIssuerFromJWT(token: string) {
  return decodeJwt(token).iss;
}

export { createSignedJWT, verifyJWT, getJWKS, getIssuerFromJWT };
