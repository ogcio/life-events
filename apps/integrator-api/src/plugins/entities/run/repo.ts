import { PostgresDb } from "@fastify/postgres";
import { QueryResult } from "pg";
import { RunDetailsDO } from "./types";

export class RunRepo {
  pg: PostgresDb;

  constructor(pg: PostgresDb) {
    this.pg = pg;
  }

  getUserRuns(userId: string): Promise<QueryResult<RunDetailsDO>> {
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

  getUserRunById(
    runId: string,
    userId: string,
  ): Promise<QueryResult<RunDetailsDO>> {
    return this.pg.query(
      `SELECT
              id,
              title,
              user_id as "userId",
              journey_id as "journeyId",
              status,
              created_at as "createdAt",
              updated_at as "updatedAt",
            FROM runs
            WHERE id = $1 AND user_id = $2`,
      [runId, userId],
    );
  }

  getRunStepsByRunId(runId: string): Promise<QueryResult<any>> {
    return this.pg.query(
      `SELECT
                id,
                run_id as "runId",
                step_id as "stepId",
                status,
                data,
                created_at as "createdAt",
                updated_at as "updatedAt",
              FROM run_steps
              WHERE run_id = $1`,
      [runId],
    );
  }
}
