import { Pool } from "pg";
import type { Journey, JourneyStep } from "../types";

const getJourney = async (pgpool: Pool, journeyId: string) => {
  return pgpool.query<Journey>(
    `
    SELECT
      j.id,
      j.title,
      j.user_id as "userId",
      j.organization_id as "organizationId",
      j.status,
      j.initial_step_id as "initialStepId",
      array_agg(
        json_build_object(
          'id', js.id,
          'stepType', js.step_type,
          'stepNumber', js.step_number,
          'stepData', js.step_data
        )
      ) as steps,
      array_agg(
        json_build_object(
          'id', sc.id,
          'sourceStepId', sc.source_step_id,
          'destinationStepId', sc.destination_step_id
        )
      ) as connections,
      j.created_at as "createdAt",
      j.updated_at as "updatedAt"
    FROM journeys as j
    LEFT JOIN journey_steps as js ON js.journey_id = j.id
    LEFT JOIN journey_steps_connections as sc ON sc.journey_id = j.id
    WHERE j.id = $1
    GROuP BY j.id
    `,
    [journeyId],
  );
};

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

export { getJourneySteps, getJourney };
