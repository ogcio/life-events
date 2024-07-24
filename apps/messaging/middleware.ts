import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { AuthenticationFactory } from "./app/utils/authentication-factory";
import { cookies } from "next/headers";
const locales = ["en", "ga"];
const DEFAULT_LOCALE = "en";
const NEXT_LOCALE_COOKIE = "NEXT_LOCALE";

export default async function (request: NextRequest) {
  let preferredLanguage = DEFAULT_LOCALE;
  if (!cookies().get(NEXT_LOCALE_COOKIE)) {
    preferredLanguage = await getPreferredLanguage(DEFAULT_LOCALE);
  }

  const nextResponse = createMiddleware({
    locales,
    defaultLocale: preferredLanguage,
  })(request);

  nextResponse.headers.append("x-pathname", request.nextUrl.pathname);
  return nextResponse;
}

export const config = {
  matcher: ["/((?!static|health|api|_next/static|_next/image|favicon.ico).*)"],
};

const getPreferredLanguage = async (
  fallbackLanguage: string,
): Promise<string> => {
  const authenticationContext = AuthenticationFactory.getInstance();
  if (!(await authenticationContext.isAuthenticated())) {
    return fallbackLanguage;
  }

  const userProfile = await AuthenticationFactory.getProfileClient({
    authenticationContext,
  });
  const user = await userProfile.getUser();

  return user.data?.preferredLanguage ?? fallbackLanguage;
};
