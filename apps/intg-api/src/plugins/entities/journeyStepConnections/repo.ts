import { PostgresDb } from "@fastify/postgres";
import { QueryResult } from "pg";
import {
  CreateJourneyStepConnectionDO,
  JourneyStepConnectionDO,
} from "./types";

export class JourneyStepConnectionsRepo {
  private pg: PostgresDb;

  constructor(pg: PostgresDb) {
    this.pg = pg;
  }

  getConnectionById(
    connectionId: string,
  ): Promise<QueryResult<JourneyStepConnectionDO>> {
    return this.pg.query(
      `SELECT
          id,
          source_step_id as "sourceStepId",
          destination_step_id as "destinationStepId"
        FROM journey_steps_connections
        WHERE id = $1`,
      [connectionId],
    );
  }

  getConnectionsByJourneyId(
    journeyId: string,
  ): Promise<QueryResult<JourneyStepConnectionDO>> {
    return this.pg.query(
      `SELECT
          id,
          source_step_id as "sourceStepId",
          destination_step_id as "destinationStepId"
        FROM journey_steps_connections
        WHERE journey_id = $1`,
      [journeyId],
    );
  }

  createConnection(
    connection: CreateJourneyStepConnectionDO,
  ): Promise<QueryResult<JourneyStepConnectionDO>> {
    return this.pg.query(
      `INSERT INTO journey_steps_connections (
          source_step_id,
          destination_step_id,
          journey_id
        )
        VALUES ($1, $2, $3)
        RETURNING
          id,
          source_step_id as "sourceStepId",
          destination_step_id as "destinationStepId"
      `,
      [
        connection.sourceStepId,
        connection.destinationStepId,
        connection.journeyId,
      ],
    );
  }

  deleteConnection(connectionId: string) {
    return this.pg.query(
      `DELETE FROM journey_steps_connections
        WHERE id = $1
      `,
      [connectionId],
    );
  }
}
