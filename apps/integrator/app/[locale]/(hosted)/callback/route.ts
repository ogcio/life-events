import { handleSignIn } from "@logto/next/server-actions";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import {
  getSignInConfiguration,
  logtoUserIdCookieName,
  postLoginRedirectUrlCookieName,
} from "../../../../libraries/logtoConfig";
import { AuthenticationFactory } from "../../../../libraries/authentication-factory";
import { cookies } from "next/headers";

const DEFAULT_POST_LOGIN_REDIRECT_URL = "/";

export async function GET(request: NextRequest) {
  await handleSignIn(getSignInConfiguration(), request.nextUrl.searchParams);

  const user = await AuthenticationFactory.getInstance().getUser();

  /**
   * In some scenarios in E2E tests, user ID is required. Because this information
   * is not on the page, we must store it in a cookie for later usage.
   */
  cookies().set(logtoUserIdCookieName, user.id);

  const postRedirectUrl = cookies().get(postLoginRedirectUrlCookieName)?.value;
  if (postRedirectUrl) {
    cookies().delete(postLoginRedirectUrlCookieName);
  }

  redirect(postRedirectUrl ?? DEFAULT_POST_LOGIN_REDIRECT_URL);
}
