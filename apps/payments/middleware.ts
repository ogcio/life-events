import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
const locales = ["en", "ga"];

export default createMiddleware({ locales, defaultLocale: "en" });

export const config = {
  matcher: ["/((?!static|health|api|_next/static|_next/image|favicon.ico).*)"],
};
