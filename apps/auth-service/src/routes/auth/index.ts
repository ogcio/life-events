import * as url from "url";
import path from "path";
import { FastifyInstance } from "fastify";
import { Type } from "@sinclair/typebox";
import fs from "fs";
import { HttpError } from "../../types/httpErrors.js";
import { setCookie } from "./utils/cookies.js";
import callback from "./callback.js";
import streamToString from "./utils/streamToString.js";
import {
  CALLBACK_URL,
  CLIENT_ID,
  REDIRECT_TIMEOUT,
  REDIRECT_URL,
  SESSION_ID,
} from "./utils/replacementConstants.js";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

export default async function login(app: FastifyInstance) {
  app.register(callback);

  app.get<{
    Querystring: {
      redirectUrl: string;
    };
  }>(
    "/",
    {
      schema: {
        tags: ["Auth"],
        querystring: { redirectUrl: Type.String() },
        response: { 200: Type.String(), 500: HttpError },
      },
    },
    async (request, reply) => {
      let redirectUrl = request.query.redirectUrl;
      const sessionId = request.cookies.sessionId;

      if (sessionId) {
        const query = await app.pg.query(
          `
          SELECT
          s.token,
          s.user_id AS "userId",
          u.is_public_servant as "publicServant"
          FROM govid_sessions s
          JOIN users u on u.id = s.user_id
          WHERE s.id=$1`,
          [sessionId],
        );

        if (query.rowCount && redirectUrl) {
          const stream = fs.createReadStream(
            path.join(__dirname, "..", "static", "redirect.html"),
          );

          const result = (await streamToString(stream))
            .replace(SESSION_ID, sessionId)
            .replace(REDIRECT_URL, redirectUrl)
            .replaceAll(REDIRECT_TIMEOUT, app.config.REDIRECT_TIMEOUT);

          return reply.type("text/html").send(result);
        }
      }

      redirectUrl = redirectUrl || "/";

      setCookie(request, reply, "redirectUrl", redirectUrl);
      const authorizeUrl = app.config.MYGOVID_URL.replace(
        CALLBACK_URL,
        app.config.CALLBACK_URL,
      ).replace(CLIENT_ID, app.config.CLIENT_ID);
      return reply.redirect(authorizeUrl);
    },
  );

  app.get<{
    Querystring: {
      redirectUrl: string;
    };
  }>(
    "/logout",
    {
      schema: {
        tags: ["Auth"],
        querystring: { redirectUrl: Type.Optional(Type.String()) },
        response: {
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
      const sessionId = request.cookies.sessionId;

      await app.pg.query("DELETE FROM govid_sessions WHERE id=$1", [sessionId]);

      return reply.redirect(
        `/auth?${new URLSearchParams(request.query).toString()}`,
      );
    },
  );
}
