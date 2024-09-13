import { getTranslations } from "next-intl/server";
import { AuthenticationFactory } from "../../../../../libraries/authentication-factory";
import { notFound, redirect, RedirectType } from "next/navigation";
import { PageWrapper } from "../../PageWrapper";
import { pgpool } from "../../../../../libraries/postgres";
import {
  getUserSubmissions,
  getUserSubmissionSteps,
  insertNewSubmissionStep,
} from "../../../../utils/submissions";
import { STEP_STATUS, STEP_TYPE } from "../../../../types";
import { getJourneySteps } from "../../../../utils/journeys";
import pluginRunner from "./pluginRunner";

// TODO: outsource types to file

type FormStepData = {
  formUrl: string;
};

// TODO: outsource types to file

type Props = {
  params: {
    locale: string;
    journey: string;
  };
};

export default async (props: Props, params) => {
  const { locale, journey: journeyId } = props.params;

  const t = await getTranslations();

  const {
    isPublicServant,
    isInactivePublicServant,
    user: { id: userId },
  } = await AuthenticationFactory.getInstance().getContext();

  if (isInactivePublicServant) {
    return redirect("/admin/inactivePublicServant", RedirectType.replace);
  }

  if (isPublicServant) {
    return redirect("/admin/journeys", RedirectType.replace);
  }

  //INTEGRATOR ENGINE

  // the journy_id is unique for a user
  const submissionDataQueryResult = await getUserSubmissions(pgpool, userId);

  const submissionData = submissionDataQueryResult.rows?.[0];

  if (!submissionData) {
    await pgpool.query(
      "INSERT INTO submissions (journey_id, user_id) VALUES($1, $2)",
      [journeyId, userId],
    );
  }

  // get all journey steps
  const journeyStepsQueryResult = await getJourneySteps(pgpool, journeyId);

  if (!journeyStepsQueryResult.rows.length) {
    return notFound();
  }

  const journeySteps = journeyStepsQueryResult.rows;
  // get all journey steps

  // get all journey step submissions
  const userSubmissionStepsQueryResult = await getUserSubmissionSteps(
    pgpool,
    userId,
    journeyId,
  );

  //check if there are missing steps
  const userSubmissionStepsData = userSubmissionStepsQueryResult.rows;
  // get all journey step submissions

  console.log({ journeySteps });

  for (const step of journeySteps) {
    // get step data
    const currentSubmissionStepData = userSubmissionStepsData.find(
      ({ stepId }) => stepId === step.id,
    );

    console.log({ currentSubmissionStepData });

    let stepStatus: STEP_STATUS;
    //there is no submissionData for the current step
    if (!currentSubmissionStepData) {
      //add the pending one
      await insertNewSubmissionStep(pgpool, submissionData.id, step.id);
      stepStatus = STEP_STATUS.PENDING;
    } else {
      stepStatus = currentSubmissionStepData.status;
    }

    switch (stepStatus) {
      case STEP_STATUS.COMPLETED: {
        // if this step is completed, move to next
        // check if needed to retrieve data

        continue;
      }
      case STEP_STATUS.FAILED: {
        // todo
      }
      case STEP_STATUS.IN_PROGRESS: {
        // todo - should do nothing ???
      }
      case STEP_STATUS.PENDING: {
        // execute the step

        return pluginRunner(step);
      }
    }
  }

  return (
    <div className="govie-width-container" style={{ width: "100%" }}>
      <div className="two-columns-layout">
        <div className="column">
          <h1 className="govie-heading-l">{t("title")}</h1>
          <div>handle journesy here</div>
        </div>
      </div>
    </div>
  );
};
