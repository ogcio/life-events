import createNextIntlPlugin from "next-intl/plugin";
import path from 'path'
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const withNextIntl = createNextIntlPlugin("./i18n.ts");
console.log(path.join(__dirname, '../../'),);

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["auth", "design-system", "feature-flags", "messages"],
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  }
};

export default withNextIntl(nextConfig);



