import * as url from "url";
import path from "path";
import { FastifyInstance } from "fastify";
import { Type } from "@sinclair/typebox";
import fs from "fs";
import { HttpError } from "../../types/httpErrors.js";
import { deleteCookie, setCookie } from "./utils/cookies.js";
import callback from "./callback.js";

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
      if (!redirectUrl) {
        redirectUrl = request.cookies.redirectUrl || "";
      }

      if (redirectUrl) {
        setCookie(request, reply, "redirectUrl", redirectUrl, app.config);
      }

      const stream = fs.createReadStream(
        path.join(__dirname, "..", "static", "index.html"),
      );
      return reply.type("text/html").send(stream);
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

      deleteCookie(request, reply, "sessionId", "", app.config);

      return reply.redirect(
        `/auth?${new URLSearchParams(request.query).toString()}`,
      );
    },
  );
}
