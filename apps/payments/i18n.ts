import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

const locales = ["en", "ga"];

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  const featureFlagsMessages = (
    await import(`../../packages/feature-flags/messages/${locale}.json`)
  ).default;
  const applicationMessages = (await import(`./messages/${locale}.json`))
    .default;

  return {
    messages: {
      ...applicationMessages,
      ...featureFlagsMessages,
    },
  };
});
