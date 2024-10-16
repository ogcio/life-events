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
      verificationLevel,
    } = request.body;

    const redirect_url = app.config.AUTH_SERVICE_CALLBACK_URL;

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
    const stream = fs.createReadStream(
      path.join(__dirname, "..", "index.html"),
    );

    return reply.type("text/html").send(await streamToString(stream));
  });

  app.post("/token", async (request, reply) => {
    const code = request.query.code;
    const id_token = code;
    return reply.send({ id_token });
  });
}
