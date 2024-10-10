import { PostgresDb } from "@fastify/postgres";
import { QueryResult } from "pg";
import { Id } from "../../../routes/schemas";
import {
  CreateJourneyBodyDO,
  JourneyDetailsDO,
  JourneyPublicDetailsDO,
  JourneyStatusEnum,
  JourneyStatusType,
} from "./types";

export class JourneyRepo {
  pg: PostgresDb;

  constructor(pg: PostgresDb) {
    this.pg = pg;
  }

  getJourneys(
    organizationId: string,
  ): Promise<QueryResult<JourneyPublicDetailsDO>> {
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

  getJourneyById(
    journeyId: string,
    organizationId: string,
  ): Promise<QueryResult<JourneyDetailsDO>> {
    return this.pg.query(
      `SELECT
          j.id,
          j.title,
          j.user_id as "userId",
          j.organization_id as "organizationId",
          j.status,
          j.initial_step_id as "initialStepId",
          j.created_at as "createdAt",
          j.updated_at as "updatedAt",
        FROM journeys as j
        WHERE j.id = $1 AND j.organization_id = $2
        GROUP BY j.id`,
      [journeyId, organizationId],
    );
  }

  getJourneyPublicInfo(
    journeyId: string,
  ): Promise<QueryResult<JourneyPublicDetailsDO>> {
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

  createJourney(journey: CreateJourneyBodyDO): Promise<QueryResult<Id>> {
    return this.pg.query(
      `INSERT INTO journeys(title, organization_id, status, user_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
      [
        journey.title,
        journey.organizationId,
        JourneyStatusEnum.DRAFT,
        journey.userId,
      ],
    );
  }

  activateJourney(data: {
    journeyId: string;
    status: JourneyStatusType;
    initialStepId?: string;
    organizationId: string;
  }): Promise<QueryResult<Id>> {
    return this.pg.query(
      `UPDATE journeys
        SET initial_step_id = $3, status = $4, updated_at = now()::DATE
        WHERE id = $1 and organization_id = $2
        RETURNING id`,
      [data.journeyId, data.organizationId, data.initialStepId, data.status],
    );
  }
}
