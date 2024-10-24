import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AuthenticationFactory } from "../../../../../../../libraries/authentication-factory";
import { PageWrapper } from "../../../../PageWrapper";
import { Journey } from "../../../../../../../libraries/journeyEditor/types";
import { loadJourneyById } from "../../../../../../../libraries/journeyEditor/queries";
import { pgpool } from "../../../../../../dbConnection";
import advancedFormat from "dayjs/plugin/advancedFormat";
import dayjs from "dayjs";
import { generateJourneyLink } from "../../../../../../utils/journey";
import { JourneyEditor } from "../../../../../../../libraries/journeyEditor";
import journeyDefaultFlow from "../../../../../../../libraries/journeyEditor/journeyStepFlow";

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
  dayjs.extend(advancedFormat);

  const t = await getTranslations("Journeys.details");
  const tGeneral = await getTranslations("General");

  const context = AuthenticationFactory.getInstance();
  const isPublicServant = await context.isPublicServant();

  if (!isPublicServant) {
    return notFound();
  }

  const defaultOrgId = await context.getSelectedOrganization();
  const journey = await loadJourney(journeyId);
  const editor = new JourneyEditor(journey, journeyDefaultFlow);
  const steps = editor.getStepsInfo();

  return (
    <PageWrapper locale={locale}>
      <div className="govie-width-container" style={{ width: "100%" }}>
        <div style={{ width: "100%" }}>
          <div>
            <h1
              className="govie-heading-m"
              style={{
                float: "left",
              }}
            >
              {journey.title}
            </h1>
            <Link
              className="govie-link"
              href={`/${locale}/admin/journeys/configure/${journey.id}`}
              style={{
                fontSize: "22px",
                fontWeight: "700",
                float: "right",
                lineHeight: "46px",
              }}
            >
              {tGeneral("edit")}
            </Link>
          </div>

          <dl className="govie-summary-list">
            <div className="govie-summary-list__row">
              <dt className="govie-summary-list__key">{t("status")}</dt>
              <dt className="govie-summary-list__value">
                {tGeneral(journey.status)}
              </dt>
            </div>
            <div className="govie-summary-list__row">
              <dt className="govie-summary-list__key">{t("created")}</dt>
              <dt className="govie-summary-list__value">
                {dayjs(journey.createdAt).format("Do MMM YYYY")}
              </dt>
            </div>
            <div className="govie-summary-list__row">
              <dt className="govie-summary-list__key">{t("createdBy")}</dt>
              <dt className="govie-summary-list__value"></dt>
            </div>
            <div className="govie-summary-list__row">
              <dt className="govie-summary-list__key">{t("journeyLink")}</dt>
              <dt className="govie-summary-list__value">
                <Link
                  className="govie-link"
                  href={generateJourneyLink(journeyId)}
                >
                  {generateJourneyLink(journeyId)}
                </Link>
              </dt>
            </div>
          </dl>

          <h2 className="govie-heading-m">{t("steps")}</h2>

          <dl className="govie-summary-list">
            <div className="govie-summary-list__row">
              <dt className="govie-summary-list__key">{t("buildingBlock")}</dt>
              <dt className="govie-summary-list__value">
                <strong>{t("description")}</strong>
              </dt>
            </div>

            {steps.map((step) => {
              return (
                <div className="govie-summary-list__row">
                  <dt
                    className="govie-summary-list__key"
                    style={{ fontWeight: "normal" }}
                  >
                    {step.name}
                  </dt>
                  <dt className="govie-summary-list__value">
                    {step.title || "-"}
                  </dt>
                </div>
              );
            })}
          </dl>

          <Link className="govie-link" href={`/${locale}/admin/journeys/list`}>
            {tGeneral("backToExistingJourneys")}
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
};
