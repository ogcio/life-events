import { cookies } from "next/headers";
import { decodeJwt, pgpool, PgSessions } from "./sessions";
import { redirect, RedirectType } from "next/navigation";
import { NextResponse } from "next/server";

function getDomainForCookie(hostname: string) {
  const splitted = hostname.split(".");
  if (splitted.length === 1) {
    return hostname;
  }
  const topDomain = splitted.pop();

  return `.${splitted.pop()}.${topDomain}`;
}

enum SAME_SITE_VALUES {
  LAX = "lax",
  NONE = "none",
}

function getSessionIdCookieConfig(req: Request, cookieValue: string) {
  const cookieConfig = {
    name: "sessionId",
    value: cookieValue,
    httpOnly: true,
    secure: false,
    path: "/",
  };
  const url = new URL(process.env.HOST_URL ?? req.url);
  console.log(`Auth route. Current hostname: ${url.hostname}`);
  if (url.protocol === "https:") {
    return {
      ...cookieConfig,
      secure: true,
      sameSite: SAME_SITE_VALUES.NONE,
    };
  }

  if (url.hostname !== "localhost") {
    return {
      ...cookieConfig,
      domain: getDomainForCookie(url.hostname),
    };
  }

  return {
    ...cookieConfig,
    sameSite: SAME_SITE_VALUES.LAX,
  };
}

export default async function (req: Request) {
  const formData = await req.formData();
  const token = formData.get("id_token")?.toString() ?? "";
  const password = formData.get("password");
  const isPublicServant = Boolean(formData.get("public_servant"));

  const loginUrl = process.env.LOGIN_URL;

  if (!loginUrl) {
    throw Error("Missing env var LOGIN_URL");
  }

  if (!token || password !== "123") {
    redirect(loginUrl, RedirectType.replace);
  }

  // Note, this is purely conceptual. There's no signing at this time. Read description of jose.decodeJwt for further info once we're at that stage.
  const { email, firstName, lastName } = decodeJwt(token);

  const q = await pgpool.query(
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
    [email, "not needed atm", [firstName, lastName].join(" "), isPublicServant],
  );

  console.log(`Auth route?? ${JSON.stringify(q.rows)}`);
  const [{ id, is_public_servant }] = q.rows;

  const ssid = await PgSessions.set({
    token,
    userId: id,
  });

  const or = new URL(process.env.HOST_URL ?? req.url).origin;
  console.log(`Origin ${or}`);
  const response = NextResponse.redirect(
    is_public_servant ? or + "/admin" : or,
    { status: 302 },
  );

  response.cookies.set("sessionId", ssid, getSessionIdCookieConfig(req, ssid));

  console.log(
    `Auth route. Cookie config: ${JSON.stringify(response.cookies.getAll())}`,
  );

  return response;
}
