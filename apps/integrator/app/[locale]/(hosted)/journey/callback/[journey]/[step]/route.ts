import { redirect, RedirectType } from "next/navigation";
import { ServerError } from "shared-errors";
import { AuthenticationFactory } from "../../../../../../../libraries/authentication-factory";
import { pgpool } from "../../../../../../../libraries/postgres";
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
  // TODO: validate what sent as queryParams
  const objData = Object.fromEntries(url.searchParams.entries());

  // so far only one submission per user, so we can retrieve the submissionID using the user

  //if the journey exists and the step exists, mark the step as completed and store the submissionId
  const userSubmissionStepsQueryResult = await getUserSubmissionSteps(
    pgpool,
    userId,
    journey,
  );

  const userSubmissionStepData = userSubmissionStepsQueryResult.rows?.find(
    ({ stepId }) => stepId === step,
  );

  if (!userSubmissionStepData) {
    throw new ServerError(
      INTEGRATOR_CALLBACK,
      "Internal server error",
      new Error("Journey not found"),
    );
  }

  await updateSubmissionStep(
    pgpool,
    userSubmissionStepData.submissionId,
    step,
    userId,
    journey,
    objData,
  );

  return redirect(`/journey/${journey}`, RedirectType.replace);
}
