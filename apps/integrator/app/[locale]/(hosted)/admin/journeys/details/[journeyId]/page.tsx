import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AuthenticationFactory } from "../../../../../../../libraries/authentication-factory";
import { PageWrapper } from "../../../../PageWrapper";
import dayjs from "dayjs";
import { generateJourneyLink } from "../../../../../../utils/journey";
import { errorHandler } from "../../../../../../utils/errorHandler";

type Props = {
  params: {
    locale: string;
    journeyId: string;
  };
};

export default async ({ params: { locale, journeyId } }: Props) => {
  const t = await getTranslations("Journeys.details");
  const tGeneral = await getTranslations("General");

  const context = AuthenticationFactory.getInstance();
  const isPublicServant = await context.isPublicServant();

  if (!isPublicServant) {
    return notFound();
  }

  const client = await AuthenticationFactory.getIntegratorClient();
  const { data: journey, error } = await client.getJourneyById(journeyId);

  const errors = errorHandler(error);

  return (
    <PageWrapper locale={locale}>
      <div className="govie-width-container" style={{ width: "100%" }}>
        <div style={{ width: "100%" }}>
          <div
            className="govie-width-container"
            style={{ width: "100%", fontSize: "16px" }}
          >
            <Link
              className="govie-link"
              href={`/${locale}/admin/journeys/list`}
            >
              {`< ${tGeneral("back")}`}
            </Link>
          </div>

          <section
            style={{
              margin: "1rem 0",
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div>
              <h1
                className="govie-heading-m"
                style={{
                  float: "left",
                }}
              >
                {journey?.data.title}
              </h1>
              <Link
                className="govie-link"
                href={`/${locale}/admin/journeys/configure/${journey?.data.id}`}
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
                  {tGeneral(journey?.data.status)}
                </dt>
              </div>
              <div className="govie-summary-list__row">
                <dt className="govie-summary-list__key">{t("created")}</dt>
                <dt className="govie-summary-list__value">
                  {dayjs(journey?.data.createdAt).format("Do MMM YYYY")}
                </dt>
              </div>
              <div className="govie-summary-list__row">
                <dt className="govie-summary-list__key">{t("createdBy")}</dt>
                <dt className="govie-summary-list__value">
                  {/* {await getUserNameById(journey.userId, defaultOrgId)} */}
                </dt>
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
                <dt className="govie-summary-list__key">
                  {t("buildingBlock")}
                </dt>
                <dt className="govie-summary-list__value">
                  <strong>{t("description")}</strong>
                </dt>
              </div>

              {/* {steps.map((step) => {
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
            })} */}
            </dl>
          </section>
        </div>
      </div>
    </PageWrapper>
  );
};
