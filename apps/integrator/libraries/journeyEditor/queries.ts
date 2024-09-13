import { Pool } from "pg";
import { Journey, JourneyStatus } from "./types";

export const createJourney = (
  pg: Pool,
  data: {
    title: string;
    organizationId: string;
  },
) => {
  return pg.query<{
    id: string;
  }>(
    `
        INSERT INTO journeys(title, organization_id, status)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
    [data.title, data.organizationId, JourneyStatus.CREATED],
  );
};

export const loadJourneyById = (
  pg: Pool,
  data: {
    journeyId: number;
    organizationId: string;
  },
) => {
  return pg.query<Journey>(
    `
        SELECT
            j.id,
            j.title,
            array_agg(
                json_build_object(
                    'id', s.id,
                    'type', s.step_type,
                    'stepNumber', s.step_number,
                    'data', s.step_data
                )
            ) as steps,
            j.status
        FROM journeys as j
        LEFT JOIN journey_steps as s ON s.journey_id = j.id
        WHERE j.id = $1 AND j.organization_id = $2
        GROuP BY j.id
      `,
    [data.journeyId, data.organizationId],
  );
};
