import { PostgresDb } from "@fastify/postgres";
import { QueryResult } from "pg";
import { RunDO } from "./types";

export class RunRepo {
  pg: PostgresDb;

  constructor(pg: PostgresDb) {
    this.pg = pg;
  }

  getRuns(userId: string): Promise<QueryResult<RunDO>> {
    return this.pg.query(
      `SELECT
        id,
        status,
        journey_id as "journeyId",
        created_at as "createdAt",
        updated_at as "updatedAt",
        user_id as "userId"
      FROM runs
      WHERE user_id = $1
      ORDER BY created_at DESC`,
      [userId],
    );
  }
}
