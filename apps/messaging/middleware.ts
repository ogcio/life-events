import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
const locales = ["en", "ga"];

export default function (request: NextRequest) {
  const nextResponse = createMiddleware({ locales, defaultLocale: "en" })(
    request,
  );

  nextResponse.headers.append("x-pathname", request.nextUrl.pathname);
  return nextResponse;
}

export const config = {
  matcher: ["/((?!static|health|api|_next/static|_next/image|favicon.ico).*)"],
};
