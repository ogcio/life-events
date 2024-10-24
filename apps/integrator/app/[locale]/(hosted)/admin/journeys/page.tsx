import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AuthenticationFactory } from "../../../../../libraries/authentication-factory";
import { PageWrapper } from "../../PageWrapper";
import Link from "next/link";
import ArrowSvg from "../../../../styles/arrowSvg";

type Props = {
  params: {
    locale: string;
  };
};

export default async ({ params: { locale } }: Props) => {
  const t = await getTranslations("Journeys");

  const { isPublicServant } =
    await AuthenticationFactory.getInstance().getContext();

  if (!isPublicServant) {
    return notFound();
  }

  return (
    <PageWrapper locale={locale}>
      <div className="govie-width-container" style={{ width: "100%" }}>
        <h1 className="govie-heading-l">{t("title")}</h1>

        <div
          style={{
            maxWidth: "410px",
          }}
        >
          <div
            style={{
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <Link
                  className="govie-link"
                  href={`/${locale}/admin/journeys/create`}
                  style={{
                    fontSize: "18px",
                  }}
                >
                  {t("createJourney")}
                </Link>
                <p
                  className="govie-body"
                  style={{
                    marginTop: "16px",
                  }}
                >
                  {t("createJourneyDescription")}
                </p>
              </div>
              <div>
                <ArrowSvg />
              </div>
            </div>
            <hr className="govie-section-break govie-section-break--visible govie-section-break--s" />
          </div>

          <div
            style={{
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <Link
                  className="govie-link"
                  href={`/${locale}/admin/journeys/list`}
                  style={{
                    fontSize: "18px",
                  }}
                >
                  {t("listJourneys")}
                </Link>
                <p
                  className="govie-body"
                  style={{
                    marginTop: "16px",
                  }}
                >
                  {t("listJourneysDescription")}
                </p>
              </div>
              <div>
                <ArrowSvg />
              </div>
            </div>
            <hr className="govie-section-break govie-section-break--visible govie-section-break--s" />
          </div>

          <div
            style={{
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <Link
                  className="govie-link"
                  href={`/${locale}/admin/journeys/runs`}
                  style={{
                    fontSize: "18px",
                  }}
                >
                  {t("listJourneyRuns")}
                </Link>
                <p
                  className="govie-body"
                  style={{
                    marginTop: "16px",
                  }}
                >
                  {t("listJourneyRunsDescription")}
                </p>
              </div>
              <div>
                <ArrowSvg />
              </div>
            </div>
            <hr className="govie-section-break govie-section-break--visible govie-section-break--s" />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};
