import * as url from "url";
import path from "path";
import { FastifyInstance } from "fastify";
import { PostAuthFormData } from "../../types/schemaDefinitions.js";
import { Type } from "@sinclair/typebox";
import { HttpError } from "../../types/httpErrors.js";
import decodeJWT from "./utils/decodeJWT.js";
import { deleteCookie, setCookie } from "./utils/cookies.js";
import fs from "fs";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const streamToString = (stream: fs.ReadStream): Promise<string> => {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", (err) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
};

export default async (app: FastifyInstance) => {
  app.post<{
    Body: PostAuthFormData;
  }>(
    "/callback",
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
      const { email, firstName, lastName } = decodeJWT(id_token);

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

      const [{ id: user_id }] = q.rows;

      const query = await app.pg.query<{ id: string }, string[]>(
        `INSERT INTO govid_sessions(token, user_id) VALUES($1, $2) RETURNING id`,
        [id_token, user_id],
      );

      if (!query.rowCount) {
        throw new Error("failed to create session");
      }

      const [{ id: ssid }] = query.rows;

      deleteCookie(request, reply, "redirectUrl", "", app.config);

      setCookie(request, reply, "sessionId", ssid, app.config);

      const stream = fs.createReadStream(
        path.join(__dirname, "..", "static", "redirect.html"),
      );

      let result = await streamToString(stream);
      result = result.replace("%sessionId%", ssid);
      result = result.replace("%redirectUrl%", redirectUrl);

      return reply.type("text/html").send(result);

      // if (is_public_servant) {
      //   return reply.redirect(`${redirectUrl}/admin`);
      // }

      // return reply.redirect(`${redirectUrl}/`);
    },
  );
};
