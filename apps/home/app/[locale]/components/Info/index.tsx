import "design-system/dist/style.css";
import "design-system/dist/esm/index.css";
import "./Info.scss";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import hero from "../../../../public/landingPage/hero.png";
import payments from "../../../../public/landingPage/payments.png";
import messaging from "../../../../public/landingPage/messaging.png";
import designSystem from "../../../../public/landingPage/designSystem.png";
import forms from "../../../../public/landingPage/forms.png";
import { getLinks } from "../../../../utils/index";

type Props = {
  locale: string;
};

export default async ({ locale }: Props) => {
  const t = await getTranslations("LandingPage");

  const environment = String(process.env.ENVIRONMENT);
  const links = getLinks(environment, locale);

  return (
    <>
      <div className="govie-width-container">
        <hr className="govie-section-break  govie-section-break--m" />

        <div className="two-columns-layout">
          <div className="column">
            <h1 className="govie-heading-l">{t("sections.main.title")}</h1>
            <h2 className="govie-heading-m">{t("sections.main.subtitle")}</h2>

            <p className="govie-body">{t("sections.main.description")}</p>

            <hr className="govie-section-break" />
            <p className="govie-body">{t("sections.main.secondaryP1")}</p>
            <p className="govie-body">{t("sections.main.secondaryP2")}</p>

            <a href={links.learnMoreForm.href}>
              <button
                id="button"
                data-module="govie-button"
                className="govie-button govie-button--primary"
              >
                {t("sections.main.cta")}
                <svg
                  className="govie-button__icon-right"
                  width="16"
                  height="17"
                  viewBox="0 0 16 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 0.5L6.59 1.91L12.17 7.5H0V9.5H12.17L6.59 15.09L8 16.5L16 8.5L8 0.5Z"
                    fill="white"
                  ></path>
                </svg>
              </button>
            </a>
          </div>
          <div className="column">
            <Image
              src={hero}
              alt={t("sections.main.title")}
              layout="responsive"
            />
          </div>
        </div>
      </div>
      <hr className="govie-section-break govie-section-break--visible govie-section-break--xl" />

      <div className="govie-width-container">
        <div className="two-columns-layout align-items-center">
          <div className="column">
            <Image
              src={forms}
              alt={t("sections.forms.title")}
              layout="responsive"
            />
          </div>
          <div className="column">
            <h2 className="govie-heading-l">{t("sections.forms.title")}</h2>

            <p className="govie-body">{t("sections.forms.description")}</p>
            <a className="govie-link" href={links.formsUrl.href}>
              {t("sections.forms.cta")}
            </a>
          </div>
        </div>
        <hr className="govie-section-break govie-section-break--visible govie-section-break--xl" />

        <div className="two-columns-layout align-items-center">
          <div className="column">
            <h2 className="govie-heading-l">{t("sections.payments.title")}</h2>

            <p className="govie-body">{t("sections.payments.description")}</p>
            <a className="govie-link" href={links.paymentsUrl.href}>
              {t("sections.payments.cta")}
            </a>
          </div>
          <div className="column">
            <Image
              src={payments}
              alt={t("sections.payments.title")}
              layout="responsive"
            />
          </div>
        </div>

        <hr className="govie-section-break govie-section-break--visible govie-section-break--xl" />

        <div className="two-columns-layout align-items-center">
          <div className="column">
            <Image
              src={messaging}
              alt={t("sections.messaging.title")}
              layout="responsive"
            />
          </div>
          <div className="column">
            <h2 className="govie-heading-l">{t("sections.messaging.title")}</h2>

            <p className="govie-body">{t("sections.messaging.description")}</p>
            <a className="govie-link" href={links.messagingUrl.href}>
              {t("sections.messaging.cta")}
            </a>
          </div>
        </div>

        <hr className="govie-section-break govie-section-break--visible govie-section-break--xl" />

        <div className="two-columns-layout align-items-center">
          <div className="column">
            <strong
              className="govie-tag govie-tag--green govie-phase-banner__content__tag"
              style={{
                marginBottom: "10px",
              }}
            >
              {t("sections.designSystem.inDev").toUpperCase()}
            </strong>
            <h2 className="govie-heading-l">
              {t("sections.designSystem.title")}
            </h2>

            <p className="govie-body">
              {t("sections.designSystem.description")}
            </p>
            <a className="govie-link" href={links.designSystemUrl.href}>
              {t("sections.designSystem.cta")}
            </a>
          </div>
          <div className="column">
            <Image
              src={designSystem}
              alt={t("sections.designSystem.title")}
              layout="responsive"
            />
          </div>
        </div>

        <hr className="govie-section-break govie-section-break--visible govie-section-break--xl" />
      </div>

      <div className="govie-width-container">
        <div>
          <h2 className="govie-heading-l">{t("sections.advantages.title")}</h2>
          <p className="govie-body">{t("sections.advantages.description")}</p>

          <div className="three-columns-layout">
            <div className="column">
              <h3 className="govie-heading-m">
                {t("sections.advantages.noProcurement.title")}
              </h3>
              <p className="govie-body">
                {t("sections.advantages.noProcurement.description")}
              </p>
            </div>

            <div className="column">
              <h3 className="govie-heading-m">
                {t("sections.advantages.noCode.title")}
              </h3>
              <p className="govie-body">
                {t("sections.advantages.noCode.description")}
              </p>
            </div>

            <div className="column">
              <h3 className="govie-heading-m">
                {t("sections.advantages.lowCost.title")}
              </h3>
              <p className="govie-body">
                {t("sections.advantages.lowCost.description")}
              </p>
            </div>

            <div className="column">
              <h3 className="govie-heading-m">
                {t("sections.advantages.accessible.title")}
              </h3>
              <p className="govie-body">
                {t("sections.advantages.accessible.description")}
              </p>
            </div>

            <div className="column">
              <h3 className="govie-heading-m">
                {t("sections.advantages.trustedExperience.title")}
              </h3>
              <p className="govie-body">
                {t("sections.advantages.trustedExperience.description")}
              </p>
            </div>

            <div className="column">
              <h3 className="govie-heading-m">
                {t("sections.advantages.test.title")}
              </h3>
              <p className="govie-body">
                {t("sections.advantages.test.description")}
              </p>
            </div>
          </div>
        </div>

        <hr className="govie-section-break govie-section-break--visible govie-section-break--xl" />

        <div>
          <h2 className="govie-heading-l">{t("sections.footer.title")}</h2>

          <p className="govie-body">{t("sections.footer.listDescription")}</p>
          <ul className="govie-list govie-list--bullet">
            <li>{t("sections.footer.listItem1")}</li>
            <li>{t("sections.footer.listItem2")}</li>
            <li>{t("sections.footer.listItem3")}</li>
          </ul>
          <p className="govie-body">{t("sections.footer.descriptionP1")}</p>
          <p className="govie-body">{t("sections.footer.descriptionP2")}</p>
          <a href={links.learnMoreForm.href}>
            <button
              id="button"
              data-module="govie-button"
              className="govie-button govie-button--primary"
            >
              {t("sections.footer.cta")}
              <svg
                className="govie-button__icon-right"
                width="16"
                height="17"
                viewBox="0 0 16 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 0.5L6.59 1.91L12.17 7.5H0V9.5H12.17L6.59 15.09L8 16.5L16 8.5L8 0.5Z"
                  fill="white"
                ></path>
              </svg>
            </button>
          </a>
        </div>
      </div>

      <hr className="govie-section-break govie-section-break govie-section-break--l" />
    </>
  );
};
