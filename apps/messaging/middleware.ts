import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";
import { ProfileAuthenticationFactory } from "./app/utils/profile-authentication-factory";
import { cookies } from "next/headers";
import { getCommonLoggerWithEnvLevel } from "./app/utils/messaging";

const locales = ["en", "ga"];
const DEFAULT_LOCALE = "en";
const NEXT_LOCALE_COOKIE = "NEXT_LOCALE";

export default async function (request: NextRequest) {
  getCommonLoggerWithEnvLevel().trace(
    {
      destinationUrl: request.nextUrl.toString(),
      cookies: request.cookies.getAll(),
    },
    "I am in middleware",
  );

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

export const config = {
  matcher: ["/((?!static|health|api|_next/static|_next/image|favicon.ico).*)"],
};

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

  return user.data.preferredLanguage ?? fallbackLanguage;
};
