import { getTranslations } from "next-intl/server";
import AddFeatureFlagForm from "feature-flags/components/AddFeatureFlagForm";
import FeatureFlagsList from "feature-flags/components/FeatureFlagsList";

export default async () => {
  const t = await getTranslations("FeatureFlags");

  return (
    <main className="govie-main-wrapper " id="main-content" role="main">
      <h1 className="govie-heading-l">{t("title")}</h1>
      <FeatureFlagsList application="portal" />
      <AddFeatureFlagForm application="portal" />
    </main>
  );
};
