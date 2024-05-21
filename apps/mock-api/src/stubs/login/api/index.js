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
    const { password, public_servant, firstName, lastName, redirect_url } =
      request.body;

    if (password !== "123") {
      reply.redirect("/static/login/api/authorize");
    }

    const createUnsecuredJwt = (firstName, lastName) => {
      // Based on the govid jwt token, filled with some random data
      const body = {
        ver: "1.0",
        iss: `https://account.mygovid.ie/123/`,
        sub: "rayareP7P1tpbKlhdCIP3bUrvnBubjTulLynzBDwIWI=", // This is what we use for id?
        aud: "90b25d29-392c-4572-9c98-0fba36185a9f",
        exp: Date.now() + 1000 + 60,
        nonce:
          "638433403850391380.ZWI3ZmJlMzgtM2U5MS00NmZhLTkxZmItZjg3MjI4OTZmZDA1NjQzNzQ5NjctZjVlYi00YjA1LThlYTItOWM3ZDhiODkwN2Y0",
        iat: 1707743623,
        auth_time: Date.now(),
        email: `${firstName}.${lastName}@${public_servant && "gov."}mail.ie`,
        oid: Math.round(Math.random() * 100000).toString(),
        LastJourney: "Login",
        givenName: firstName,
        surname: lastName,
        mobile: "+0000000000000",
        DSPOnlineLevel: "0",
        DSPOnlineLevelStatic: "0",
        AcceptedPrivacyTerms: true,
        AcceptedPrivacyTermsVersionNumber: "7",
        SMS2FAEnabled: false,
        AcceptedPrivacyTermsDateTime: 1707743379,
        trustFrameworkPolicy: "B2C_1A_signin-V5-LIVE",
        CorrelationId: "123",
        nbf: 1707743623,
      };

      return new jose.UnsecuredJWT(body).encode();
    };

    const id_token = createUnsecuredJwt(firstName, lastName);

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

  app.post("/token", async (request, reply) => {
    const code = request.query.code;
    const id_token = code;
    return reply.send({ id_token });
  });
}
