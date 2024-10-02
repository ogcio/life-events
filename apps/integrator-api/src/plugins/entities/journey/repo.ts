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

  getJourneys(organizationId: string): Promise<QueryResult<JourneyDetailsDO>> {
    return this.pg.query(
      `SELECT
        id,
        title,
        status,
        organization_id as "organizationId",
        created_at as "createdAt",
        updated_at as "updatedAt",
        user_id as "userId"
      FROM journeys
      WHERE organization_id = $1
      ORDER BY created_at DESC`,
      [organizationId],
    );
  }

  getJourneyById(journeyId: string): Promise<QueryResult<JourneyDetailsDO>> {
    return this.pg.query(
      `SELECT
          id,
          title,
          user_id as "userId",
          organization_id as "organizationId",
          status,
          created_at as "createdAt",
          updated_at as "updatedAt",
        FROM journeys
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
