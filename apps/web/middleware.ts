import createMiddleware from "next-intl/middleware";
import type { NextRequest } from 'next/server'
const locales = ["en", "ga"];

export default (request: NextRequest) => {
  return createMiddleware({ locales, defaultLocale: "en" })(request);
};

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
