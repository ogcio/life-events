import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { AuthenticationFactory } from "../../../../../../../../../libraries/authentication-factory";
import { PageWrapper } from "../../../../../../PageWrapper";
import { JourneyEditor } from "../../../../../../../../../libraries/journeyEditor";
import { pgpool } from "../../../../../../../../dbConnection";
import { Journey } from "../../../../../../../../../libraries/journeyEditor/types";
import Link from "next/link";
import { loadJourneyById } from "../../../../../../../../../libraries/journeyEditor/queries";
import journeyDefaultFlow from "../../../../../../../../../libraries/journeyEditor/journeyStepFlow";

type Props = {
  params: {
    locale: string;
    journeyId: string;
    stepId: string;
  };
};

const loadJourney = async (
  journeyId: string,
  step: {
    stepType: string;
    stepNumber: string;
  },
): Promise<Journey> => {
  "use server";

  const { organization } =
    await AuthenticationFactory.getInstance().getContext();

  if (!organization) {
    throw new Error("Unauthorized!");
  }

  const result = await loadJourneyById(pgpool, {
    journeyId,
    organizationId: organization.id,
    step,
  });

  if (result.rowCount !== 1) {
    return notFound();
  }

  return result.rows[0];
};

export default async ({ params: { locale, journeyId, stepId } }: Props) => {
  const tGeneral = await getTranslations("General");
  const tWidgets = await getTranslations("Journeys.widgets");
  const t = await getTranslations("Journeys.addSteps");

  const { isPublicServant } =
    await AuthenticationFactory.getInstance().getContext();

  if (!isPublicServant) {
    // TODO: Change this to citizen route
    return notFound();
  }

  const [stepType, stepNumber] = stepId.split("-");

  const journey = await loadJourney(journeyId, {
    stepType,
    stepNumber,
  });

  const editor = new JourneyEditor(journey, journeyDefaultFlow);
  const step = editor.getStep(stepId);

  if (!step) {
    return notFound();
  }

  const saveStepAction = async (formData: FormData) => {
    "use server";
    const journey = JSON.parse(formData.get("journey") as string);

    const editor = new JourneyEditor(journey, journeyDefaultFlow);
    const step = editor.getStep(stepId);

    if (!step) {
      throw new Error("Step not found");
    }

    await step.saveData(formData, pgpool);
    redirect(`/${locale}/admin/journeys/configure/${journeyId}`);
  };

  return (
    <PageWrapper locale={locale}>
      <form action={saveStepAction}>
        <div className="govie-width-container">{step.renderForm(tWidgets)}</div>

        <div className="govie-width-container">
          <input type="submit" value={t("add")} className="govie-button" />
        </div>

        <div className="govie-width-container">
          <Link
            className="govie-link"
            href={`/${locale}/admin/journeys/configure/${journeyId}`}
          >
            {tGeneral("back")}
          </Link>
        </div>

        <input type="hidden" name="journey" value={JSON.stringify(journey)} />
      </form>
    </PageWrapper>
  );
};
