import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AuthenticationFactory } from "../../../../../../libraries/authentication-factory";
import { PageWrapper } from "../../../PageWrapper";
import Link from "next/link";
import { getJourneys } from "../../../../../../libraries/journeyEditor/queries";
import { pgpool } from "../../../../../dbConnection";
import { EmptyStatus } from "../../../../../components/EmptyStatus";
import dayjs from "dayjs";
import { generateJourneyLink } from "../../../../../utils/journey";
import CopyLink from "../../../../../components/CopyBtn";
import advancedFormat from "dayjs/plugin/advancedFormat";

type Props = {
  params: {
    locale: string;
  };
};

const getJourneysList = async () => {
  "use server";

  const { organization } =
    await AuthenticationFactory.getInstance().getContext();

  if (!organization) {
    throw new Error("Unauthorized!");
  }

  const result = await getJourneys(pgpool, {
    organizationId: organization.id,
  });

  return result.rows;
};

export default async ({ params: { locale } }: Props) => {
  dayjs.extend(advancedFormat);

  const t = await getTranslations("Journeys.existingJourneys");
  const tGeneral = await getTranslations("General");

  const { isPublicServant } =
    await AuthenticationFactory.getInstance().getContext();

  if (!isPublicServant) {
    return notFound();
  }

  const journeys = await getJourneysList();

  return (
    <PageWrapper locale={locale}>
      <div className="table-container">
        <section
          style={{
            margin: "1rem 0",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h1 className="govie-heading-m">{t("title")}</h1>
          {journeys?.length === 0 ? (
            <EmptyStatus
              title={t("empty.title")}
              description={t("empty.description")}
            />
          ) : (
            <div
              style={{
                width: "100%",
                overflowX: "auto",
              }}
            >
              <table className={`govie-table scrollable-table`}>
                <thead className="govie-table__head">
                  <tr className="govie-table__row">
                    <th scope="col" className="govie-table__header">
                      {t("tableHeaders.name")}
                    </th>
                    <th scope="col" className="govie-table__header">
                      {t("tableHeaders.createdBy")}
                    </th>
                    <th scope="col" className="govie-table__header">
                      {t("tableHeaders.created")}
                    </th>
                    <th scope="col" className="govie-table__header">
                      {t("tableHeaders.updated")}
                    </th>
                    <th scope="col" className="govie-table__header">
                      {t("tableHeaders.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="govie-table__body">
                  {journeys?.map((journey) => (
                    <tr
                      className="govie-table__row"
                      key={journey.id}
                      data-journey-id={journey.id}
                    >
                      <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                        {journey.title}
                      </td>
                      <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                        ...
                      </td>
                      <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                        {dayjs(journey.createdAt).format("Do MMM YYYY")}
                      </td>
                      <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                        {dayjs(journey.updatedAt).format("Do MMM YYYY")}
                      </td>
                      <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                        <div
                          style={{
                            minWidth: "190px",
                          }}
                        >
                          <Link
                            className="govie-link"
                            href={`/${locale}/admin/journeys/details/${journey.id}`}
                            style={{
                              marginRight: "12px",
                            }}
                          >
                            {tGeneral("journeyStatus")}
                          </Link>

                          <CopyLink
                            link={generateJourneyLink(journey.id)}
                            buttonText={tGeneral("copyLink")}
                            linkStyle={true}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Link className="govie-link" href={`/${locale}/admin/journeys`}>
                {tGeneral("backToHome")}
              </Link>
            </div>
          )}
        </section>
      </div>
    </PageWrapper>
  );
};
