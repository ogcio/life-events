import { handleSignIn } from "@logto/next/server-actions";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import logtoConfig, {
  logtoUserIdCookieName,
  postLoginRedirectUrlCookieName,
} from "../../../../libraries/logtoConfig";
import { cookies } from "next/headers";
import { AuthenticationFactory } from "../../../../libraries/authentication-factory";

const DEFAULT_POST_LOGIN_REDIRECT_URL = "/";

export async function GET(request: NextRequest) {
  await handleSignIn(logtoConfig, request.nextUrl.searchParams);

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
