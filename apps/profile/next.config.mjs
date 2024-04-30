import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["auth", "design-system", "feature-flags", "messages"],
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default withNextIntl(nextConfig);
