import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";
const locales = ["en", "ga"];

export default function (request: NextRequest) {
  const nextResponse = createMiddleware({ locales, defaultLocale: "en" })(
    request,
  );

  nextResponse.headers.append("x-pathname", request.nextUrl.pathname);
  const sessionCookie = request.cookies.get("sessionId");
  if (sessionCookie && !nextResponse.cookies.has("sessionId")) {
    console.log("Setting cookie in middleware");
    nextResponse.cookies.set(sessionCookie);
  }
  return nextResponse;
}

export const config = {
  matcher: ["/((?!static|api|health|_next/static|_next/image|favicon.ico).*)"],
};
