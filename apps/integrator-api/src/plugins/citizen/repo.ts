import { PostgresDb } from "@fastify/postgres";
import { QueryResult } from "pg";
import { JourneyDetailsDO } from "../../routes/schemas";

export class CitizenRepo {
  pg: PostgresDb;

  constructor(pg: PostgresDb) {
    this.pg = pg;
  }

  getJourneyById(journeyId: string): Promise<QueryResult<JourneyDetailsDO>> {
    return this.pg.query(
      `SELECT
          id,
          title,
          user_id as "userId",
          organization_id as "organizationId",
          status
        FROM journeys
        WHERE id = $1`,
      [journeyId],
    );
  }
}
