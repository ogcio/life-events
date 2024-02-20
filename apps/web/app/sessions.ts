import { Pool } from "pg";
import * as jose from "jose";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

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
};

export interface Sessions {
  get(key: string): Promise<Session | undefined>;
  set(session: Session, userId: string): Promise<string>;
  delete(key: string): Promise<void>;
  utils: {
    decodeJwt(token: string): SessionTokenDecoded;
  };
}

export const pgpool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

export const PgSessions: Sessions = {
  async get(key: string) {
    const query = await pgpool.query<{ token: string }, [string]>(
      `SELECT token FROM govid_sessions WHERE id=$1`,
      [key]
    );

    if (!query.rowCount) {
      return undefined;
    }

    const [{ token }] = query.rows;
    return { token };
  },
  async set(session: Session, userId: string) {
    const query = await pgpool.query<{ id: string }, string[]>(
      `INSERT INTO govid_sessions(token, user_id) VALUES($1, $2) RETURNING id`,
      [session.token, userId]
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
  utils: {
    decodeJwt(token: string) {
      const decoded = jose.decodeJwt<jose.JWTPayload & GovIdJwtPayload>(token);
      return {
        firstName: decoded.givenName,
        lastName: decoded.surname,
        email: decoded.email,
      };
    },
  },
};
