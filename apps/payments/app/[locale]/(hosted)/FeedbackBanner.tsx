import { useTranslations } from "next-intl";
import Banner from "../../components/Banner";

export default () => {
  const t = useTranslations("FeedbackBanner");
  return (
    <Banner
      tag={t("tag")}
      text={t.rich("bannerText", {
        mail: (chunks) => (
          <a
            className="govie-link"
            href="mailto:tiago.ramos@nearform.com?subject=Feedback"
          >
            {chunks}
          </a>
        ),
      })}
    />
  );
};
