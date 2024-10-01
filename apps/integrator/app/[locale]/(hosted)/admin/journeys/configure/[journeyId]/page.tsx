import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { AuthenticationFactory } from "../../../../../../../libraries/authentication-factory";
import { PageWrapper } from "../../../../PageWrapper";
import { JourneyEditor } from "../../../../../../../libraries/journeyEditor";
import { pgpool } from "../../../../../../dbConnection";
import {
  Journey,
  JourneyStatus,
} from "../../../../../../../libraries/journeyEditor/types";
import ds from "design-system";
import Link from "next/link";
import styles from "./style.module.scss";
import {
  activateJourney,
  clearStepConnections,
  loadJourneyById,
  saveStepConnections,
} from "../../../../../../../libraries/journeyEditor/queries";
import InputField from "../../../../../../components/InputField";
import CopyLink from "../../../../../../components/CopyBtn";
import journeyDefaultFlow from "../../../../../../../libraries/journeyEditor/journeyStepFlow";
import { generateJourneyLink } from "../../../../../../utils/journey";

const Icon = ds.Icon;

type Props = {
  params: {
    locale: string;
    journeyId: string;
  };
};

const loadJourney = async (journeyId: string): Promise<Journey> => {
  "use server";

  const { organization } =
    await AuthenticationFactory.getInstance().getContext();

  if (!organization) {
    throw new Error("Unauthorized!");
  }

  const result = await loadJourneyById(pgpool, {
    journeyId,
    organizationId: organization.id,
  });

  if (result.rowCount !== 1) {
    return notFound();
  }

  return result.rows[0];
};

export default async ({ params: { locale, journeyId } }: Props) => {
  const tGeneral = await getTranslations("General");
  const t = await getTranslations("Journeys.addSteps");

  const { isPublicServant } =
    await AuthenticationFactory.getInstance().getContext();

  if (!isPublicServant) {
    // TODO: Change this to citizen route
    return notFound();
  }

  const journey = await loadJourney(journeyId);

  const editor = new JourneyEditor(journey, journeyDefaultFlow);
  const steps = editor.getStepsInfo();
  const stepConnections = editor.getStepConnections();

  const journeyCompleted = editor.isCompleted();

  const saveJourneyAction = async () => {
    "use server";

    const { organization } =
      await AuthenticationFactory.getInstance().getContext();

    if (!organization) {
      throw new Error("Unauthorized!");
    }

    await activateJourney(pgpool, {
      journeyId,
      organizationId: organization.id,
      startStepId: stepConnections[0]?.sourceStepId,
    });

    await clearStepConnections(pgpool, {
      journeyId,
    });

    if (stepConnections.length) {
      await saveStepConnections(pgpool, {
        journeyId,
        connections: stepConnections,
      });
    }

    redirect(`/${locale}/admin/journeys/configure/${journeyId}`);
  };

  return (
    <PageWrapper locale={locale}>
      <form action={saveJourneyAction}>
        <div className="table-container">
          <h1 className="govie-heading-l">{t("title")}</h1>

          <table className="govie-table scrollable-table">
            <tbody className="govie-table__body">
              {steps.map((step) => (
                <tr className="govie-table__row" key={step.stepNumber}>
                  <td
                    className={`govie-table__cell govie-table__cell--vertical-centralized govie-body-s ${styles.iconCol}`}
                  >
                    <Icon
                      icon={"check-mark"}
                      className="govie-button__icon-left"
                      color={
                        step.completed
                          ? ds.colours.ogcio.darkGreen
                          : ds.colours.ogcio.lightGrey
                      }
                    />
                  </td>
                  <td
                    className={`govie-table__cell govie-table__cell--vertical-centralized govie-body-s ${styles.titleCol} ${styles.ellipsis}`}
                  >
                    <span>
                      <strong>{step.name}:</strong> {step.title}
                    </span>
                  </td>
                  <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                    {step.required && (
                      <div className={styles.stepRequired}>
                        {tGeneral("required").toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                    <Link
                      className="govie-link"
                      href={`/${locale}/admin/journeys/configure/${journeyId}/step/${step.id}`}
                    >
                      {tGeneral(step.actionTitle)}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="govie-width-container">
          <input
            type="submit"
            value={t("submit")}
            className="govie-button"
            disabled={!journeyCompleted}
          />
        </div>

        {journey.status === JourneyStatus.ACTIVE && (
          <div
            style={{
              display: "flex",
              alignItems: "end",
              justifyContent: "space-between",
              gap: "18px",
            }}
          >
            <div
              style={{
                width: "100%",
              }}
            >
              <InputField
                name="journeyLink"
                label={`${tGeneral("shareLink")}:`}
                type="text"
                defaultValue={generateJourneyLink(journey.id)}
              />
            </div>

            <CopyLink
              link={generateJourneyLink(journey.id)}
              buttonText={tGeneral("copyLink")}
            />
          </div>
        )}

        <div className="govie-width-container">
          <Link className="govie-link" href={`/${locale}/admin/journeys`}>
            {tGeneral("back")}
          </Link>
        </div>
      </form>
    </PageWrapper>
  );
};
