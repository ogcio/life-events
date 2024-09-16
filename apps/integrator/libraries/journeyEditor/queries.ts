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

export const completeJourney = (
  pg: Pool,
  data: {
    journeyId: string;
    organizationId: string;
  },
) => {
  return pg.query(
    `
      UPDATE journeys
      SET status = 'completed'
      WHERE id = $1 and organization_id = $2
    `,
    [data.journeyId, data.organizationId],
  );
};

export const loadJourneyById = (
  pg: Pool,
  data: {
    journeyId: string;
    organizationId: string;
    step?: {
      stepType: string;
      stepNumber: string;
    };
  },
) => {
  const queryData = [data.journeyId, data.organizationId];
  let joinQuery = "LEFT JOIN journey_steps as s ON s.journey_id = j.id";

  if (data.step) {
    joinQuery += " AND s.step_type = $3 AND s.step_number = $4";
    queryData.push(data.step.stepType, data.step.stepNumber);
  }

  const query = `
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
    ${joinQuery}
    WHERE j.id = $1 AND j.organization_id = $2
    GROuP BY j.id
  `;

  return pg.query<Journey>(query, queryData);
};
