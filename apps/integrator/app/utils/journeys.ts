import { Pool } from "pg";
import type { JourneyStep } from "../types";

const getJourneySteps = async (pgpool: Pool, journeyId: string) => {
  return pgpool.query<JourneyStep>(
    `
    SELECT js.id, js.journey_id as "journeyId", js.step_type as "stepType", js.step_number as "stepNumber", js.created_at as "createdAt", js.updated_at as "updatedAt", js.step_data as "stepData"
    FROM journey_steps js, journeys j 
    WHERE js.journey_id = j.id
        AND j.id = $1
    ORDER BY js.step_number
    `,
    [journeyId],
  );
};

export { getJourneySteps };
