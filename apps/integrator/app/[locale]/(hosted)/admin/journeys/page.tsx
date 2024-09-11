import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AuthenticationFactory } from "../../../../../libraries/authentication-factory";
import { PageWrapper } from "../../PageWrapper";
import Link from "next/link";

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
        <div className="two-columns-layout">
          <div className="column">
            <h1 className="govie-heading-l">{t("title")}</h1>

            <div
              style={{
                marginBottom: "24px",
              }}
            >
              <Link
                className="govie-link"
                href={`/${locale}/admin/journeys/create`}
                style={{
                  fontSize: "24px",
                }}
              >
                {t("createJourney")}
              </Link>
              <p className="govie-body">{t("createJourneyDescription")}</p>
              <hr className="govie-section-break govie-section-break--visible govie-section-break--s" />
            </div>

            <div
              style={{
                marginBottom: "24px",
              }}
            >
              <Link
                className="govie-link"
                href={`/${locale}/admin/journeys/list`}
                style={{
                  fontSize: "24px",
                }}
              >
                {t("listJourneys")}
              </Link>
              <p className="govie-body">{t("listJourneysDescription")}</p>
              <hr className="govie-section-break govie-section-break--visible govie-section-break--s" />
            </div>
          </div>
          <div className="column">
            <div
              style={{
                width: "100%",
                height: "200px",
                backgroundColor: "#DDD",
              }}
            >
              {/* Tutorial video placeholder */}
            </div>
            {t("tutorialVideo")}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};
