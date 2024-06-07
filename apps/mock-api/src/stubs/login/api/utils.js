import crypto from "crypto";
import { importPKCS8, SignJWT } from "jose";

const getRandomPhoneNumber = () =>
  `+353${Math.floor(Math.random() * 9000000000) + 1000000000}`;

const getRandomString = () => crypto.randomBytes(20).toString("hex");

export const createMockSignedJwt = async (firstName, lastName, email) => {
  const body = {
    ver: "1.0",
    sub: getRandomString(),
    auth_time: Date.now(),
    email: email,
    oid: getRandomString(),
    AlternateIds: "",
    BirthDate: "13/06/1941",
    PublicServiceNumber: "0111019P",
    LastJourney: "Login",
    mobile: getRandomPhoneNumber(),
    DSPOnlineLevel: "0",
    DSPOnlineLevelStatic: "0",
    givenName: firstName,
    surname: lastName,
    CustomerId: "532",
    AcceptedPrivacyTerms: true,
    AcceptedPrivacyTermsVersionNumber: "7",
    SMS2FAEnabled: false,
    AcceptedPrivacyTermsDateTime: 1715582120,
    firstName: firstName,
    lastName: lastName,
    currentCulture: "en",
    trustFrameworkPolicy: "B2C_1A_MyGovID_signin-v5-PARTIAL2",
    CorrelationId: getRandomString(),
    nbf: 1716804749,
  };

  const alg = "RS256";
  const privateKey = await importPKCS8(process.env.JWK_PRIVATE_KEY, alg);

  const jwt = await new SignJWT(body)
    .setProtectedHeader({ alg })
    .setAudience(process.env.LOGTO_APP_ID)
    .setIssuedAt()
    .setIssuer(process.env.AUTH_SERVICE_URL)
    .setExpirationTime("2h")
    .sign(privateKey);

  return jwt;
};
