import { PostgresDb } from "@fastify/postgres";
import { QueryResult } from "pg";
import { CreateJourneyBodyDO, JourneyDetailsDO } from "../../../routes/schemas";

enum JourneyStatus {
  ACTIVE = "active",
  DRAFT = "draft",
}

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
          j.status
        FROM journeys j
        WHERE j.id = $1`,
      [journeyId],
    );
  }

  createJourney(journey: CreateJourneyBodyDO) {
    return this.pg.query(
      `INSERT INTO journeys(title, organization_id, status, user_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
      [
        journey.title,
        journey.organizationId,
        JourneyStatus.DRAFT,
        journey.userId,
      ],
    );
  }
}
