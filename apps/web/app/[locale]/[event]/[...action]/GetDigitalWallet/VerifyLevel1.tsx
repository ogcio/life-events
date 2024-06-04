import { getTranslations } from "next-intl/server";

export default async () => {
  const t = await getTranslations("GetDigitalWallet.VerifyAccountLevel1");
  return (
    <div className="govie-grid-row">
      <div className="govie-grid-column-two-thirds-from-desktop">
        <div className="govie-heading-l">{t("title")}</div>
        <p className="govie-body">{t("whyVerifyFirstParagraph")}</p>
        <p className="govie-body">
          {t.rich("whyVerifySecondParagraph", {
            link: (chunks) => (
              <a className="govie-link" href="https://www.mygovid.ie/">
                {chunks}
              </a>
            ),
          })}
        </p>
        <p className="govie-body">
          {t.rich("whyVerifyThirdParagraph", {
            link: (chunks) => (
              <a className="govie-link" href={`${process.env.HOST_URL}`}>
                {chunks}
              </a>
            ),
          })}
        </p>
      </div>
    </div>
  );
};
