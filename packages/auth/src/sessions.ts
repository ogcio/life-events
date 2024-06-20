import { Pool } from "pg";
import * as jose from "jose";
import { cookies, headers } from "next/headers.js";
import { redirect, RedirectType } from "next/navigation.js";
import { GovIdJwtPayload, Sessions } from "./types";

export const pgpool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB_NAME_SHARED,
});

export const buildPgPool = () =>
  new Pool({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB_NAME_SHARED,
  });

export async function getPgSession(key: string) {
  const query = await pgpool.query<
    {
      token: string;
      userId: string;
      publicServant: boolean;
      verificationLevel: number;
    },
    [string]
  >(
    `
      SELECT
        s.token,
        s.user_id AS "userId",
        u.is_public_servant as "publicServant",
        u.verification_level as "verificationLevel"
      FROM govid_sessions s
      JOIN users u on u.id = s.user_id
      WHERE s.id=$1`,
    [key],
  );

  if (!query.rowCount) {
    return undefined;
  }

  const [{ token, userId, publicServant, verificationLevel }] = query.rows;
  return { token, userId, publicServant, verificationLevel };
}

export function decodeJwt(token: string) {
  const decoded = jose.decodeJwt<jose.JWTPayload & GovIdJwtPayload>(token);
  return {
    firstName: decoded.givenName,
    lastName: decoded.surname,
    email: decoded.email,
    birthDate: decoded.BirthDate,
    publicServiceNumber: decoded.PublicServiceNumber,
    dspOnlineLevel: decoded.DSPOnlineLevel,
    mobile: decoded.mobile,
  };
}

export const getSessionData = async (sessionId: string) => {
  const session = await getPgSession(sessionId);
  if (!session) return null;

  const decodedJWT = decodeJwt(session.token);
  const { dspOnlineLevel, mobile } = decodedJWT;

  return {
    ...decodedJWT,
    userId: session.userId,
    publicServant: session.publicServant,
    verificationLevel: session.verificationLevel,
    sessionId,
  };
};

export const PgSessions: Sessions = {
  async get(redirectUrl_) {
    const authServiceUrl = process.env.AUTH_SERVICE_URL;

    if (!authServiceUrl) {
      throw Error("Missing env var AUTH_SERVICE_URL");
    }

    const redirectUrl = redirectUrl_ || "/";
    const loginUrl = `${authServiceUrl}/auth?redirectHost=${process.env.HOST_URL}&redirectPath=${redirectUrl}`;

    const sessionId = cookies().get("sessionId")?.value;
    if (!sessionId) {
      return redirect(loginUrl, RedirectType.replace);
    }

    const sessionData = await getSessionData(sessionId);

    if (!sessionData) {
      return redirect(loginUrl, RedirectType.replace);
    }

    return sessionData;
  },
  async isAuthenticated() {
    const sessionId = cookies().get("sessionId")?.value;
    if (!sessionId) {
      return false;
    }

    const session = await getPgSession(sessionId);

    return !!session;
  },
};

export async function getUserInfoById(userId: string) {
  const res = await pgpool.query<{
    id: string;
    govid_email: string;
    govid: string;
    user_name: string;
    is_public_servant: boolean;
    verification_level: number;
  }>(`SELECT * FROM users WHERE id = $1`, [userId]);

  if (res.rows.length === 0) return null;
  return res.rows[0];
}

// Such safe
export async function getUsers() {
  return pgpool
    .query<{ id: string; email: string; lang: string }>(
      `
    SELECT id, govid_email as "email", 'en' as "lang" FROM users where is_public_servant = FALSE
  `,
    )
    .then((res) => res.rows);
}

export async function getUsersForIds(ids: string[]) {
  const args = ids.map((_, i) => `$${i + 1}`).join(", ");

  return pgpool
    .query<{ id: string; email: string; lang: string }>(
      `
    SELECT id, govid_email as "email", 'en' as "lang" FROM users 
    where is_public_servant = FALSE and id in (${args})
  `,
      ids,
    )
    .then((res) => res.rows);
}
