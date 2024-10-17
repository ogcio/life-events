import { PostgresDb } from "@fastify/postgres";
import { QueryResult } from "pg";
import {
  CreateJourneyStepDO,
  JourneyStepDO,
  UpdateJourneyStepDO,
} from "./types";

export class JourneyStepsRepo {
  private pg: PostgresDb;

  constructor(pg: PostgresDb) {
    this.pg = pg;
  }

  getStepById(stepId: string): Promise<QueryResult<JourneyStepDO>> {
    return this.pg.query(
      `SELECT
          id,
          journey_id as "journeyId",
          step_type as "stepType",
          step_data as "stepData",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM journey_steps
        WHERE id = $1`,
      [stepId],
    );
  }

  getStepsByJourneyId(journeyId: string): Promise<QueryResult<JourneyStepDO>> {
    return this.pg.query(
      `SELECT
          id,
          journey_id as "journeyId",
          step_type as "stepType",
          step_data as "stepData",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM journey_steps
        WHERE journey_id = $1`,
      [journeyId],
    );
  }

  createStep(step: CreateJourneyStepDO): Promise<QueryResult<JourneyStepDO>> {
    return this.pg.query(
      `INSERT INTO journey_steps (
          journey_id,
          step_type,
          step_data
        )
        VALUES ($1, $2, $3)
        RETURNING
          id,
          journey_id as "journeyId",
          step_type as "stepType",
          step_data as "stepData",
          created_at as "createdAt",
          updated_at as "updatedAt"
      `,
      [step.journeyId, step.stepType, step.stepData],
    );
  }

  updateStep(
    stepId: string,
    step: UpdateJourneyStepDO,
  ): Promise<QueryResult<JourneyStepDO>> {
    return this.pg.query(
      `UPDATE journey_steps
        SET
          step_type = $2,
          step_data = $3,
          updated_at = now()
        WHERE id = $1
        RETURNING
          id,
          journey_id as "journeyId",
          step_type as "stepType",
          step_data as "stepData",
          created_at as "createdAt",
          updated_at as "updatedAt"
      `,
      [stepId, step.stepType, step.stepData],
    );
  }

  deleteStep(stepId: string) {
    return this.pg.query(
      `DELETE FROM journey_steps
        WHERE id = $1
      `,
      [stepId],
    );
  }
}
