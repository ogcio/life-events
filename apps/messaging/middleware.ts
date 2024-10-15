import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
const locales = ["en", "ga"];
const DEFAULT_LOCALE = "en";

export default async function (request: NextRequest) {
  const nextResponse = createMiddleware({
    locales,
    defaultLocale: DEFAULT_LOCALE,
  })(request);

  nextResponse.headers.append("x-pathname", request.nextUrl.pathname);
  nextResponse.headers.append("x-href", request.nextUrl.href);
  return nextResponse;
}

export const config = {
  matcher: ["/((?!static|health|api|_next/static|_next/image|favicon.ico).*)"],
};
