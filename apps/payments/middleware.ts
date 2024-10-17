import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { getCommonLogger } from "nextjs-logging-wrapper";
const locales = ["en", "ga"];

export default async function (request: NextRequest) {
  const regex = new RegExp(
    "^/((static|health|api|_next/static|_next/image|favicon.ico).*)",
  );
  getCommonLogger().trace(
    { destinationUrl: request.nextUrl.toString() },
    "I am in middleware",
  );

  if (regex.test(request.nextUrl.pathname)) {
    const requestHeaders: string[] = [];
    request.headers.forEach((header) => {
      requestHeaders.push(`${header[0]}: ${header[1]}`);
    });
    getCommonLogger().trace(
      {
        destinationUrl: request.nextUrl.pathname,
        cookies: request.cookies.getAll(),
        requestHeaders,
      },
      "Usually this pathname should not pass through middleware, testing...",
    );

    // I tried to log next response, but it is always empty
    return NextResponse.next();
  }

  const nextResponse = createMiddleware({
    locales,
    defaultLocale: "en",
  })(request);

  nextResponse.headers.append("x-url", request.url);

  return nextResponse;
}

// export const config = {
//   matcher: ["/((?!static|health|api|_next/static|_next/image|favicon.ico).*)"],
// };
