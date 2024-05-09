import * as url from "url";
import path from "path";
import { FastifyInstance } from "fastify";
import { Type } from "@sinclair/typebox";
import fs from "fs";
import * as jose from "jose";
import { HttpError } from "../../types/httpErrors.js";
import { PostAuthFormData } from "../../types/schemaDefinitions.js";

type GovIdJwtPayload = {
  surname: string;
  givenName: string;
  email: string;
};

const decodeJwt = (token: string) => {
  const decoded = jose.decodeJwt<jose.JWTPayload & GovIdJwtPayload>(token);
  return {
    firstName: decoded.givenName,
    lastName: decoded.surname,
    email: decoded.email,
  };
};

enum SAME_SITE_VALUES {
  STRICT = "strict",
  LAX = "lax",
  NONE = "none",
}

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

export default async function login(app: FastifyInstance) {
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
        const secure = request.protocol === "https";
        const sameSite = secure
          ? SAME_SITE_VALUES.STRICT
          : SAME_SITE_VALUES.LAX;

        reply.setCookie("redirectUrl", redirectUrl, {
          domain: process.env.DOMAIN_HOST,
          httpOnly: true,
          secure: secure,
          sameSite,
        });
      }

      const stream = fs.createReadStream(
        path.join(__dirname, "..", "static", "index.html"),
      );
      return reply.type("text/html").send(stream);
    },
  );

  app.post<{
    Body: PostAuthFormData;
  }>(
    "/auth",
    {
      schema: {
        tags: ["Auth"],
        body: PostAuthFormData,
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
      const { id_token, password, public_servant = false } = request.body;

      const publicServantBoolean = new Boolean(public_servant);

      const redirectUrl = request.cookies.redirectUrl || "/auth";

      if (!id_token || password !== "123") {
        reply.redirect("/auth");
      }

      // Note, this is purely conceptual. There's no signing at this time. Read description of jose.decodeJwt for further info once we're at that stage.
      const { email, firstName, lastName } = decodeJwt(id_token);

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

      const [{ id: user_id, is_public_servant }] = q.rows;

      const query = await app.pg.query<{ id: string }, string[]>(
        `INSERT INTO govid_sessions(token, user_id) VALUES($1, $2) RETURNING id`,
        [id_token, user_id],
      );

      if (!query.rowCount) {
        throw new Error("failed to create session");
      }

      const [{ id: ssid }] = query.rows;

      reply.setCookie("redirectUrl", "", {
        domain: process.env.DOMAIN_HOST,
        httpOnly: true,
        path: "/",
        // secure: secure,
        // sameSite: secure ? SAME_SITE_VALUES.STRICT : SAME_SITE_VALUES.NONE,
        expires: new Date(Date.now() - 100),
      });

      const secure = request.protocol === "https";
      const sameSite = secure ? SAME_SITE_VALUES.STRICT : SAME_SITE_VALUES.LAX;

      reply.setCookie("sessionId", ssid, {
        httpOnly: true,
        secure,
        sameSite,
        path: "/",
      });

      if (is_public_servant) {
        return reply.redirect(`${redirectUrl}/admin`);
      }

      return reply.redirect(`${redirectUrl}/`);
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

      const secure = request.protocol === "https";
      const sameSite = secure ? SAME_SITE_VALUES.STRICT : SAME_SITE_VALUES.LAX;

      await app.pg.query("DELETE FROM govid_sessions WHERE id=$1", [sessionId]);
      reply.cookie("sessionId", "asdasd", {
        domain: process.env.DOMAIN_HOST,
        httpOnly: true,
        path: "/",
        expires: new Date(Date.now() - 100),
        secure,
        sameSite,
      });

      return reply.redirect(
        `/auth?${new URLSearchParams(request.query).toString()}`,
      );
    },
  );

  app.get(
    "/users",
    {
      schema: {
        tags: ["Auth"],
      },
    },
    async () => {
      const res = await app.pg.query("select * from users");
      return { users: res.rows };
    },
  );
}
