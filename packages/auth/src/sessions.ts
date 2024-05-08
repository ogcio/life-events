import { Pool } from "pg";
import * as jose from "jose";
import { cookies } from "next/headers.js";
import { redirect, RedirectType } from "next/navigation.js";

type GovIdJwtPayload = {
  surname: string;
  givenName: string;
  email: string;
};

type SessionTokenDecoded = {
  firstName: string;
  lastName: string;
  email: string;
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
    }
  >;
  set(session: Session): Promise<string>;
  delete(key: string): Promise<void>;
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

async function getPgSession(key: string) {
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
  };
}

export const PgSessions: Sessions = {
  async get() {
    const sessionId = cookies().get("sessionId")?.value;
    if (!sessionId) {
      return redirect("/logout", RedirectType.replace);
    }

    const session = await getPgSession(sessionId); //PgSessions.get(sessionId);

    if (!session) {
      return redirect("/logout", RedirectType.replace);
    }

    return {
      ...decodeJwt(session.token),
      userId: session.userId,
      publicServant: session.publicServant,
    };
  },
  async set(session: Session) {
    const query = await pgpool.query<{ id: string }, string[]>(
      `INSERT INTO govid_sessions(token, user_id) VALUES($1, $2) RETURNING id`,
      [session.token, session.userId],
    );

    if (!query.rowCount) {
      throw new Error("failed to create session");
    }

    const [{ id }] = query.rows;
    return id;
  },
  async delete(key: string) {
    await pgpool.query("DELETE FROM govid_sessions WHERE id=$1", [key]);
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
