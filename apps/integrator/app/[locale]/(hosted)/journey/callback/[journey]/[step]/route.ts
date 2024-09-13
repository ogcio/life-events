import { NextResponse } from "next/server";
import { ServerError } from "shared-errors";
import { pgpool } from "../../../../../../../libraries/postgres";
import { AuthenticationFactory } from "../../../../../../../libraries/authentication-factory";
import { redirect, RedirectType } from "next/navigation";
import { getJourneySteps } from "../../../../../../utils/journeys";
import {
  getUserSubmissionSteps,
  updateSubmissionStep,
} from "../../../../../../utils/submissions";

type CallbackRouteParams = {
  params: { journey: string; step: string; locale: string };
};

const INTEGRATOR_CALLBACK = "INTEGRATOR_CALLBACK";

export async function GET(request: Request, { params }: CallbackRouteParams) {
  const { journey, step } = params;

  const {
    user: { id: userId },
  } = await AuthenticationFactory.getInstance().getContext();

  const url = new URL(request.url);

  const formsSubmmissionID = url.searchParams.get("submissionId");

  if (!formsSubmmissionID) {
    throw new ServerError(
      INTEGRATOR_CALLBACK,
      "Internal server error",
      new Error("Submission Id not provided"),
    );
  }

  // so far only one submission per user, so we can retrieve the submissionID using the user

  //if the journey exists and the step exists, mark the step as completed and store the submissionId
  const userSubmissionStepsQueryResult = await getUserSubmissionSteps(
    pgpool,
    userId,
    journey,
  );

  const userSubmissionStepData = userSubmissionStepsQueryResult.rows?.find(
    ({ stepId }) => stepId === parseInt(step),
  );

  console.log({ userSubmissionStepData });

  if (!userSubmissionStepData) {
    throw new ServerError(
      INTEGRATOR_CALLBACK,
      "Internal server error",
      new Error("Journey not found"),
    );
  }

  // const submissionId = journeyData.
  await updateSubmissionStep(
    pgpool,
    userSubmissionStepData.submissionId,
    parseInt(step),
    userId,
    parseInt(journey),
    { submissionId: formsSubmmissionID },
  );

  return redirect(`/journey/${journey}`, RedirectType.replace);
}
