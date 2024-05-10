import { getTranslations } from "next-intl/server";

export default async () => {
  const t = await getTranslations("GetDigitalWallet.VerifyAccount");
  return (
    <div className="govie-grid-row">
      <div className="govie-grid-column-two-thirds-from-desktop">
        <div className="govie-heading-l">{t("title")}</div>
        <p className="govie-body">{t("whyVerifyFirstParagraph")}</p>
        <p className="govie-body">
          {t.rich("whyVerifySecondParagraph", {
            link: (chunks) => (
              <a
                className="govie-link"
                href="https://www.gov.ie/en/service/b6ecfd-sign-up-for-mygovid/"
              >
                {chunks}
              </a>
            ),
          })}
        </p>
        <p className="govie-body">{t("whyVerifyThirdParagraph")}</p>
      </div>
    </div>
  );
};
