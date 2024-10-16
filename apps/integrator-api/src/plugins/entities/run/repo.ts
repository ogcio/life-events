import { PostgresDb } from "@fastify/postgres";
import { QueryResult } from "pg";
import { PSRunDetailsDO, UserRunDetailsDO, RunStepDO } from "./types";

export class RunRepo {
  pg: PostgresDb;

  constructor(pg: PostgresDb) {
    this.pg = pg;
  }

  getUserRuns(userId: string): Promise<QueryResult<UserRunDetailsDO>> {
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

  getRunsByJourney(journeyId: string): Promise<QueryResult<PSRunDetailsDO>> {
    return this.pg.query(
      `SELECT
        r.id,
        r.status,
        r.journey_id as "journeyId",
        r.created_at as "createdAt",
        r.updated_at as "updatedAt",
        r.user_id as "userId",
        j.organization_id as "organizationId"
      FROM runs r
      INNER JOIN journeys j ON j.id = r.journey_id
      WHERE r.journey_id = $1
      ORDER BY r.created_at DESC`,
      [journeyId],
    );
  }

  getUserRunById(
    runId: string,
    userId: string,
  ): Promise<QueryResult<UserRunDetailsDO>> {
    return this.pg.query(
      `SELECT
              id,
              title,
              user_id as "userId",
              journey_id as "journeyId",
              status,
              created_at as "createdAt",
              updated_at as "updatedAt"
            FROM runs
            WHERE id = $1 AND user_id = $2`,
      [runId, userId],
    );
  }

  getRunById(runId: string): Promise<QueryResult<PSRunDetailsDO>> {
    return this.pg.query(
      `SELECT
              r.id,
              r.user_id as "userId",
              r.journey_id as "journeyId",
              r.status,
              r.created_at as "createdAt",
              r.updated_at as "updatedAt",
              j.organization_id as "organizationId"
            FROM runs r
            INNER JOIN journeys j ON j.id = r.journey_id
            WHERE r.id = $1`,
      [runId],
    );
  }

  getRunStepsByRunId(runId: string): Promise<QueryResult<RunStepDO>> {
    return this.pg.query(
      `SELECT
                id,
                run_id as "runId",
                step_id as "stepId",
                status,
                data,
                created_at as "createdAt",
                updated_at as "updatedAt"
              FROM run_steps
              WHERE run_id = $1`,
      [runId],
    );
  }

  createRun(
    journeyId: string,
    userId: string,
  ): Promise<QueryResult<{ id: string }>> {
    return this.pg.query(
      `INSERT INTO runs
        (journey_id, user_id, status)
        VALUES ($1, $2, 'pending')
      RETURNING id`,
      [journeyId, userId],
    );
  }

  createRunStep(
    runId: string,
    stepId: string,
  ): Promise<QueryResult<{ id: string }>> {
    return this.pg.query(
      `INSERT INTO run_steps
        (run_id, step_id, data, status)
        VALUES ($1, $2, '{}'::json, 'pending')
        RETURNING id`,
      [runId, stepId],
    );
  }
}
