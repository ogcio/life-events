import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
const locales = ["en", "ga"];

export default async function (request: NextRequest) {
  const nextResponse = createMiddleware({
    locales,
    defaultLocale: "en",
  })(request);

  nextResponse.headers.append("x-url", request.url);

  return nextResponse;
}

export const config = {
  matcher: ["/((?!static|health|api|_next/static|_next/image|favicon.ico).*)"],
};
