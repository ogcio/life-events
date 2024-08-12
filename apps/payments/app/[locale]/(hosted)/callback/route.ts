import { handleSignIn } from "@logto/next/server-actions";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import logtoConfig, {
  postLoginRedirectUrlCookieName,
} from "../../../../libraries/logtoConfig";
import { cookies } from "next/headers";

const DEFAULT_POST_LOGIN_REDIRECT_URL = "/";

export async function GET(request: NextRequest) {
  await handleSignIn(logtoConfig, request.nextUrl.searchParams);

  const postRedirectUrl = cookies().get(postLoginRedirectUrlCookieName)?.value;
  if (postRedirectUrl) {
    cookies().delete(postLoginRedirectUrlCookieName);
  }

  redirect(postRedirectUrl ?? DEFAULT_POST_LOGIN_REDIRECT_URL);
}
