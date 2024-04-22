import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";

export const locales = ["en", "ga"] as const;
export const localePrefix = "always"; // Default

export default function (request: NextRequest) {
  const nextResponse = createMiddleware({
    locales,
    defaultLocale: "en",
    localePrefix,
  })(request);

  nextResponse.headers.append("x-pathname", request.nextUrl.pathname);

  return nextResponse;
}

export const config = {
  // matcher: ["/((?!static|api|health|_next/static|_next/image|favicon.ico).*)"],
  matcher: ["/", "/(en|ga)/:path*"],
};
