import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { ProfileAuthenticationFactory } from "./app/utils/profile-authentication-factory";
import { cookies, headers } from "next/headers";
import {
  getCommonLoggerWithEnvLevel,
  streamToString,
} from "./app/utils/messaging";
const locales = ["en", "ga"];
const DEFAULT_LOCALE = "en";
const NEXT_LOCALE_COOKIE = "NEXT_LOCALE";

export default async function (request: NextRequest) {
  const regex = new RegExp(
    "^/((static|health|api|_next/static|_next/image|favicon.ico).*)",
  );
  getCommonLoggerWithEnvLevel().trace(
    { destinationUrl: request.nextUrl.toString() },
    "I am in middleware",
  );
  if (regex.test(request.nextUrl.pathname)) {
    const requestHeaders: string[] = [];
    for (const header of request.headers.entries()) {
      requestHeaders.push(`${header[0]}: ${header[1]}`);
    }
    getCommonLoggerWithEnvLevel().trace(
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

  let preferredLanguage = DEFAULT_LOCALE;
  if (!cookies().get(NEXT_LOCALE_COOKIE)) {
    preferredLanguage = await getPreferredLanguage(DEFAULT_LOCALE);
  }

  const nextResponse = createMiddleware({
    locales,
    defaultLocale: preferredLanguage,
  })(request);

  nextResponse.headers.append("x-pathname", request.nextUrl.pathname);
  nextResponse.headers.append("x-search", request.nextUrl.search);

  return nextResponse;
}

// export const config = {
//   matcher: ["/((?!static|health|api|_next/static|_next/image|favicon.ico).*)"],
// };

const getPreferredLanguage = async (
  fallbackLanguage: string,
): Promise<string> => {
  const authenticationContext = ProfileAuthenticationFactory.getInstance();
  if (!(await authenticationContext.isAuthenticated())) {
    return fallbackLanguage;
  }

  const userProfile = await ProfileAuthenticationFactory.getProfileClient();
  const contextUser = await authenticationContext.getUser();
  const user = await userProfile.getUser(contextUser.id);

  return user.data?.preferredLanguage ?? fallbackLanguage;
};
