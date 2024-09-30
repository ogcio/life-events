import { PostgresDb } from "@fastify/postgres";
import { QueryResult } from "pg";
import { JourneyDetailsDO } from "../../../routes/schemas";

export class JourneyRepo {
  pg: PostgresDb;

  constructor(pg: PostgresDb) {
    this.pg = pg;
  }

  getJourneyById(journeyId: string): Promise<QueryResult<JourneyDetailsDO>> {
    return this.pg.query(
      `SELECT
          j.id,
          j.title,
          j.user_id as "userId",
          j.organization_id as "organizationId",
          j.status"
        FROM journeys j
        WHERE j.id = $1`,
      [journeyId],
    );
  }
}
