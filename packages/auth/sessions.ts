import { Pool } from "pg";
import * as jose from "jose";
import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";

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
      isInitialized: boolean;
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
});

async function getPgSession(key: string) {
  const query = await pgpool.query<
    {
      token: string;
      userId: string;
      publicServant: boolean;
      isInitialized: boolean;
    },
    [string]
  >(
    `
      SELECT
        s.token,
        s.user_id AS "userId",
        u.is_public_servant as "publicServant",
        consent."isInitialized"
      FROM govid_sessions s
      JOIN users u on u.id = s.user_id
      LEFT JOIN LATERAL (SELECT EXISTS (SELECT 1 FROM user_consents uc WHERE uc.user_id = u.id) AS "isInitialized") AS consent ON TRUE
      WHERE s.id=$1`,
    [key],
  );

  if (!query.rowCount) {
    return undefined;
  }

  const [{ token, userId, publicServant, isInitialized }] = query.rows;
  return { token, userId, publicServant, isInitialized };
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
      isInitialized: session.isInitialized,
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
