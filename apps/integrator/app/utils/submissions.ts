import { Pool } from "pg";
import type { Submission, SubmissionStep } from "../types";

const getUserSubmissions = async (pgpool: Pool, userId: string) => {
  return pgpool.query<Submission>(
    `
    SELECT id, journey_id as "journeyId", created_at as "createdAt", updated_at as "updatedAt", user_id as "userId" FROM submissions WHERE user_id = $1
    `,
    [userId],
  );
};

export const createUserSubmissions = async (
  pgpool: Pool,
  journeyId: string,
  userId: string,
) => {
  return pgpool.query<Submission>(
    `
      INSERT INTO submissions (journey_id, user_id)
      VALUES($1, $2)
      RETURNING
        id,
        journey_id as "journeyId",
        created_at as "createdAt",
        updated_at as "updatedAt",
        user_id as "userId"`,
    [journeyId, userId],
  );
};

const getUserSubmissionSteps = async (
  pgpool: Pool,
  userId: string,
  journeyId: string,
) => {
  return pgpool.query<SubmissionStep>(
    `
    SELECT ss.id, ss.submission_id as "submissionId", ss.step_id as "stepId", ss.status, ss.created_at as "createdAt", ss.updated_at as "updatedAt"
    FROM 
      submissions s, submission_steps ss 
    WHERE s.id = ss.submission_id 
    AND s.user_id = $1
    AND s.journey_id = $2
    `,
    [userId, journeyId],
  );
};

const insertNewSubmissionStep = async (
  pgpool: Pool,
  submissionId: string,
  stepId: string,
) => {
  return pgpool.query<SubmissionStep>(
    `
    INSERT INTO 
      submission_steps (
        submission_id,
	      step_id,
	      status
      )
    VALUES (
      $1,
      $2,
      'pending'
    )
    RETURNING
      id,
      submission_id as "submissionId",
      step_id as "stepId",
      status,
      created_at as "createdAt",
      updated_at as "updatedAt"
    `,
    [submissionId, stepId],
  );
};

const updateSubmissionStep = async (
  pgpool: Pool,
  submissionId: string,
  stepId: string,
  userId: string,
  journeyId: string,
  data: { [key: string]: string | number | boolean },
) => {
  return pgpool.query(
    `
    UPDATE submission_steps ss
    SET status = 'completed', updated_at = CURRENT_TIMESTAMP, data = $5
    FROM submissions s
    WHERE 
      ss.submission_id = s.id 
      AND ss.submission_id = $1
      AND s.journey_id = $2
	    AND s.user_id = $3
	    AND ss.step_id = $4
    `,
    [submissionId, journeyId, userId, stepId, data],
  );
};

export {
  getUserSubmissions,
  getUserSubmissionSteps,
  insertNewSubmissionStep,
  updateSubmissionStep,
};
