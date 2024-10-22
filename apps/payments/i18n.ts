import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

const locales = ["en", "ga"];

export default getRequestConfig(async ({ requestLocale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(requestLocale as any)) notFound();

  const featureFlagsMessages = (
    await import(`../../packages/feature-flags/messages/${requestLocale}.json`)
  ).default;
  const applicationMessages = (await import(`./messages/${requestLocale}.json`))
    .default;

  return {
    messages: {
      ...applicationMessages,
      ...featureFlagsMessages,
    },
  };
});
