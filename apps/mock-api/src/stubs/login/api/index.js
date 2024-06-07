import fs from "fs";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import streamToString from "../../../utils/streamToString.js";
import * as jose from "jose";

export const REDIRECT_URL = "%REDIRECT_URL%";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function (app, opts) {
  app.get("/users", async (request, reply) => {
    const res = await app.pg.query("select * from users");
    return { users: res.rows };
  });

  app.post("/auth", async (request, reply) => {
    const {
      password,
      public_servant,
      firstName,
      lastName,
      email,
      redirect_url,
      verificationLevel,
    } = request.body;

    const publicServantBoolean = public_servant === "on";
    if (password !== "123") {
      reply.redirect("/static/login/api/authorize");
    }

    const verificationLevelNumber = Number(verificationLevel);

    const createUnsecuredJwt = (firstName, lastName, email) => {
      // Based on the govid jwt token, filled with some random data
      const body = {
        ver: "1.0",
        iss: "https://nonprod-account.mygovid-nonprod.ie/89792a6d-1ea4-4126-94df-a71d292debc7/v2.0/",
        sub: "FUG1jTLAJeuDPqxWYzHAVBQtFhVgNY0FE4tw6P3nnH8=",
        aud: "174db9b2-7ff3-4df1-ad58-23633a1de8cf",
        exp: Date.now() + 1000 + 60,
        nonce: "manual-te",
        iat: 1716804749,
        auth_time: Date.now(),
        email: email,
        oid: Math.round(Math.random() * 100000).toString(),
        AlternateIds: "",
        BirthDate: "13/06/1941",
        PublicServiceNumber: "0111019P",
        LastJourney: "Login",
        givenName: firstName,
        surname: lastName,
        mobile: verificationLevelNumber > 1 ? "0871234567" : "+0000000000000",
        DSPOnlineLevel: verificationLevelNumber > 0 ? "2" : "0",
        DSPOnlineLevelStatic: verificationLevelNumber > 0 ? "2" : "0",
        CustomerId: "532",
        AcceptedPrivacyTerms: true,
        AcceptedPrivacyTermsVersionNumber: "7",
        SMS2FAEnabled: false,
        AcceptedPrivacyTermsDateTime: 1715582120,
        firstName: firstName,
        lastName: lastName,
        currentCulture: "en",
        trustFrameworkPolicy: "B2C_1A_MyGovID_signin-v5-PARTIAL2",
        CorrelationId: "6a047981-c20e-482a-be2d-4715b5be8764",
        nbf: 1716804749,
      };

      return new jose.UnsecuredJWT(body).encode();
    };

    const q = await app.pg.query(
      `
              WITH get AS (
                  SELECT id, is_public_servant FROM users WHERE govid_email=$1
                ), insert_new AS (
                    INSERT INTO users(govid_email, govid, user_name, is_public_servant)
                    values($1, $2, $3, $4)
                    ON CONFLICT DO NOTHING
                    RETURNING id, is_public_servant
                )
                SELECT * FROM get UNION SELECT * FROM insert_new`,
      [
        email,
        "not needed atm",
        [firstName, lastName].join(" "),
        publicServantBoolean,
      ],
    );

    const id_token = createUnsecuredJwt(firstName, lastName, email);

    return reply.redirect(`${redirect_url}?code=${id_token}`);
  });

  app.get("/authorize", async (request, reply) => {
    const redirectUrl = request.query.redirect_uri;

    const stream = fs.createReadStream(
      path.join(__dirname, "..", "index.html"),
    );

    const result = (await streamToString(stream)).replace(
      REDIRECT_URL,
      redirectUrl,
    );
    return reply.type("text/html").send(result);
  });

  app.get("/authorize-mock", async (request, reply) => {
    const redirectUrl = request.query.redirect_uri;

    const stream = fs.createReadStream(
      path.join(__dirname, "..", "mock-login.html"),
    );

    const result = (await streamToString(stream))
      .replace(REDIRECT_URL, redirectUrl)
      .replace("%STATE%", request.query.state);
    return reply.type("text/html").send(result);
  });

  app.post("/auth-mock", async (request, reply) => {
    const { password, firstName, lastName, email, redirect_url, state } =
      request.body;

    if (password !== "123") reply.redirect("/static/login/api/authorize");

    const createMockSignedJwt = async (firstName, lastName, email) => {
      const body = {
        ver: "1.0",
        sub: "FUG1jTLAJeuDPqxWYzHAVBQtFhVgNY0FE4tw6P3nnH8=",
        auth_time: Date.now(),
        email: email,
        oid: Math.round(Math.random() * 100000).toString(),
        AlternateIds: "",
        BirthDate: "13/06/1941",
        PublicServiceNumber: "0111019P",
        LastJourney: "Login",
        mobile: "+0000000000000",
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
        CorrelationId: "6a047981-c20e-482a-be2d-4715b5be8764",
        nbf: 1716804749,
      };

      const alg = "RS256";
      const privateKey = await jose.importPKCS8(
        process.env.JWK_PRIVATE_KEY,
        alg,
      );

      const jwt = await new jose.SignJWT(body)
        .setProtectedHeader({ alg })
        .setAudience(process.env.LOGTO_APP_ID)
        .setIssuedAt()
        .setIssuer(process.env.AUTH_SERVICE_URL)
        .setExpirationTime("2h")
        .sign(privateKey);

      return jwt;
    };

    const q = await app.pg.query(
      `
              WITH get AS (
                  SELECT id, is_public_servant FROM users WHERE govid_email=$1
                ), insert_new AS (
                    INSERT INTO users(govid_email, govid, user_name, is_public_servant)
                    values($1, $2, $3, $4)
                    ON CONFLICT DO NOTHING
                    RETURNING id, is_public_servant
                )
                SELECT * FROM get UNION SELECT * FROM insert_new`,
      [email, "not needed atm", [firstName, lastName].join(" "), false],
    );

    const id_token = await createMockSignedJwt(firstName, lastName, email);

    return reply.redirect(`${redirect_url}?code=${id_token}&state=${state}`);
  });

  app.post("/token", async (request, reply) => {
    const code = request.query.code;
    const id_token = code;
    return reply.send({ id_token });
  });
}
