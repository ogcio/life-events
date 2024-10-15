import { getTranslations } from "next-intl/server";
import { AuthenticationFactory } from "../../../../../libraries/authentication-factory";
import { notFound, redirect, RedirectType } from "next/navigation";
import { pgpool } from "../../../../../libraries/postgres";
import {
  createUserSubmissions,
  getUserSubmissions,
  getUserSubmissionSteps,
} from "../../../../utils/submissions";
import { IntegratorEngine } from "../../../../../libraries/integratorEngine";
import { getJourney } from "../../../../utils/journeys";

type Props = {
  params: {
    locale: string;
    journey: string;
  };
};

export default async (props: Props) => {
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

  const client = await AuthenticationFactory.getIntegratorClient();
  const runId = await client.createRun({
    journeyId,
  });
  console.log(runId);

  //INTEGRATOR ENGINE
  /*
  // the journy_id is unique for a user
  const submissionDataQueryResult = await getUserSubmissions(pgpool, userId);

  let submissionData = submissionDataQueryResult.rows?.[0];

  if (!submissionData) {
    submissionData;
    const submissionDataQueryResult = await createUserSubmissions(
      pgpool,
      journeyId,
      userId,
    );

    if (submissionDataQueryResult.rows.length) {
      submissionData = submissionDataQueryResult.rows[0];
    }
  }

  // get journey
  const journeyResult = await getJourney(pgpool, journeyId);

  if (!journeyResult.rows.length) {
    return notFound();
  }

  const journeyData = journeyResult.rows[0];

  // get all journey step submissions
  const userSubmissionStepsQueryResult = await getUserSubmissionSteps(
    pgpool,
    userId,
    journeyId,
  );

  //check if there are missing steps
  const userSubmissionStepsData = userSubmissionStepsQueryResult.rows;
  // get all journey step submissions

  const engine = new IntegratorEngine(
    pgpool,
    submissionData,
    journeyData,
    userSubmissionStepsData,
  );
  await engine.execute(userId);
*/

  return (
    <div className="govie-width-container" style={{ width: "100%" }}>
      <div className="two-columns-layout">
        <div className="column">
          <h1 className="govie-heading-l">{t("title")}</h1>
          <div>This journey is now complete</div>
        </div>
      </div>
    </div>
  );
};
