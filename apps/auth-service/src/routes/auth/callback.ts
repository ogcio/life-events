import * as url from "url";
import path from "path";
import { FastifyInstance } from "fastify";
import { TokenType } from "../../types/schemaDefinitions.js";
import { Type } from "@sinclair/typebox";
import { HttpError } from "../../types/httpErrors.js";
import decodeJWT from "./utils/decodeJWT.js";
import { deleteCookie, setCookie } from "./utils/cookies.js";
import fs from "fs";
import streamToString from "./utils/streamToString.js";
import {
  CLIENT_SECRET,
  CODE,
  REDIRECT_HOST,
  REDIRECT_PATH,
  REDIRECT_TIMEOUT,
  SESSION_ID,
} from "./utils/replacementConstants.js";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

export default async (app: FastifyInstance) => {
  app.get<{
    Querystring: { code: string };
  }>(
    "/callback",
    {
      schema: {
        tags: ["Auth"],
        querystring: Type.Object({ code: Type.String() }),
        response: {
          200: { type: "string" },
          302: {
            headers: {
              location: Type.String(),
            },
          },
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const tokenUrl = app.config.TOKEN_URL.replace(
        CODE,
        request.query.code,
      ).replace(CLIENT_SECRET, app.config.CLIENT_SECRET);

      let data: TokenType;
      try {
        const response = await fetch(tokenUrl, {
          method: "POST",
        });

        data = (await response.json()) as TokenType;
      } catch (error) {
        app.log.error(error);
        return reply.redirect("/auth");
      }

      const { id_token } = data;

      // // Note, this is purely conceptual. There's no signing at this time. Read description of jose.decodeJwt for further info once we're at that stage.
      const { email, firstName, lastName, dspOnlineLevel, mobile } =
        decodeJWT(id_token);

      let verificationLevel = 0;
      if (dspOnlineLevel !== "0") {
        if (mobile === "+0000000000000") {
          verificationLevel = 1;
        } else {
          verificationLevel = 2;
        }
      }

      const q = await app.pg.query(
        `
          WITH get AS (
              SELECT id, is_public_servant FROM users WHERE govid_email=$1
            ), insert_new AS (
                INSERT INTO users(govid_email, govid, user_name, verification_level)
                values($1, $2, $3, $4)
                ON CONFLICT (govid_email) DO UPDATE
                SET verification_level = EXCLUDED.verification_level
                RETURNING id, is_public_servant
            )
            SELECT * FROM get UNION SELECT * FROM insert_new`,
        [
          email,
          "not needed atm",
          [firstName, lastName].join(" "),
          verificationLevel,
        ],
      );

      const [{ id: user_id }] = q.rows;

      const query = await app.pg.query<{ id: string }, string[]>(
        `INSERT INTO govid_sessions(token, user_id) VALUES($1, $2) RETURNING id`,
        [id_token, user_id],
      );

      if (!query.rowCount) {
        throw new Error("failed to create session");
      }

      const [{ id: ssid }] = query.rows;

      const redirectHost =
        request.cookies.redirectHost || app.config.FALLBACK_REDIRECT_HOST;
      deleteCookie(request, reply, "redirectHost", "");

      const redirectPath = request.cookies.redirectPath || "/";
      deleteCookie(request, reply, "redirectPath", "");

      setCookie(request, reply, "sessionId", ssid);

      const stream = fs.createReadStream(
        path.join(__dirname, "..", "static", "redirect.html"),
      );

      const result = (await streamToString(stream))
        .replace(SESSION_ID, ssid)
        .replace(REDIRECT_HOST, redirectHost)
        .replace(REDIRECT_PATH, redirectPath)
        .replaceAll(REDIRECT_TIMEOUT, app.config.REDIRECT_TIMEOUT);

      return reply.type("text/html").send(result);
    },
  );
};
