import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";
const locales = ["en", "ga"];

export default function (request: NextRequest) {
  const nextResponse = createMiddleware({ locales, defaultLocale: "en" })(
    request,
  );

  nextResponse.headers.append("x-pathname", request.nextUrl.pathname);
  nextResponse.headers.append(
    "x-searchParams",
    request.nextUrl.searchParams.toString(),
  );

  return nextResponse;
}

export const config = {
  matcher: ["/((?!static|api|health|_next/static|_next/image|favicon.ico).*)"],
};
