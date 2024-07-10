import createNextIntlPlugin from "next-intl/plugin";
import path from "path";
import * as url from "url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const withNextIntl = createNextIntlPlugin("./i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  experimental: {
    outputFileTracingRoot: path.join(__dirname, "../../"),
    instrumentationHook: true,
  },
};

export default withNextIntl(nextConfig);
