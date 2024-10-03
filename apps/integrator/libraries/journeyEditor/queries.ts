import { Pool } from "pg";
import { Journey } from "./types";

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
        j.status,
        j.initial_step_id as "initialStepId",
        j.created_at as "createdAt",
        j.updated_at as "updatedAt",
        j.user_id as "userId"
    FROM journeys as j
    ${joinQuery}
    WHERE j.id = $1 AND j.organization_id = $2
    GROuP BY j.id
  `;

  return pg.query<Journey>(query, queryData);
};

export const saveStepConnections = (
  pg: Pool,
  data: {
    connections: {
      sourceStepId: string;
      destinationStepId: string | undefined;
    }[];
    journeyId: string;
  },
) => {
  const queryData = [data.journeyId];
  const queryValues: string[] = [];

  data.connections.forEach((connection, index) => {
    if (!connection.destinationStepId) {
      return;
    }

    queryValues.push(`($1, $${index * 2 + 2}, $${index * 2 + 3})`);
    queryData.push(connection.sourceStepId, connection.destinationStepId);
  });

  if (!queryValues.length) {
    return;
  }

  return pg.query(
    `
    INSERT INTO journey_steps_connections (journey_id, source_step_id, destination_step_id) 
    VALUES
        ${queryValues.join(", ")}
    `,
    queryData,
  );
};

export const clearStepConnections = (
  pg: Pool,
  data: {
    journeyId: string;
  },
) => {
  return pg.query(
    `
      DELETE FROM journey_steps_connections
      WHERE journey_id = $1
    `,
    [data.journeyId],
  );
};
