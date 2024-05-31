import { Pool } from "pg";
import * as jose from "jose";
import { cookies, headers } from "next/headers.js";
import { redirect, RedirectType } from "next/navigation.js";

type GovIdJwtPayload = {
  surname: string;
  givenName: string;
  email: string;
  BirthDate: string;
  PublicServiceNumber: string;
  DSPOnlineLevel: string;
  mobile: string;
};

type SessionTokenDecoded = {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  publicServiceNumber: string;
};

type Session = {
  token: string;
  userId: string;
};

export interface Sessions {
  get(): Promise<
    SessionTokenDecoded & {
      userId: string;
      publicServant: boolean;
      //The values below will likely be extracted from session token  once we integrate with GOV ID
      myGovIdEmail: string;
      verificationLevel: number;
      sessionId: string;
    }
  >;
  isAuthenticated(): Promise<boolean>;
}

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
    },
    [string]
  >(
    `
      SELECT
        s.token,
        s.user_id AS "userId",
        u.is_public_servant as "publicServant"
      FROM govid_sessions s
      JOIN users u on u.id = s.user_id
      WHERE s.id=$1`,
    [key],
  );

  if (!query.rowCount) {
    return undefined;
  }

  const [{ token, userId, publicServant }] = query.rows;
  return { token, userId, publicServant };
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

  let verificationLevel = 0;
  if (dspOnlineLevel !== "0") {
    if (mobile === "+0000000000000") {
      verificationLevel = 1;
    } else {
      verificationLevel = 2;
    }
  }

  return {
    ...decodedJWT,
    userId: session.userId,
    publicServant: session.publicServant,
    //The values below will likely be extracted from session token once we integrate with GOV ID
    myGovIdEmail: "testMyGovIdEmail@test.com",
    verificationLevel,
    sessionId,
  };
};

export const PgSessions: Sessions = {
  async get() {
    const authServiceUrl = process.env.AUTH_SERVICE_URL;

    if (!authServiceUrl) {
      throw Error("Missing env var AUTH_SERVICE_URL");
    }

    const loginUrl = `${authServiceUrl}/auth?redirectUrl=${process.env.HOST_URL}`;

    const sessionId = cookies().get("sessionId")?.value;
    if (!sessionId) {
      return redirect(loginUrl, RedirectType.replace);
    }

    const sessionData = await getSessionData(sessionId); //PgSessions.get(sessionId);

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
