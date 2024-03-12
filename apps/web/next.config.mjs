import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["auth", "design-system", "feature-flags", "messages"],
};

export default withNextIntl(nextConfig);
