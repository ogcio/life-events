import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { postLoginRedirectUrlCookieName } from "../../../libraries/logtoConfig";

const FIVE_MINUTES = 5 * 60 * 1000;

export async function GET(request: NextRequest) {
  const loginUrl = request.nextUrl.searchParams.get("loginUrl");
  const postLoginRedirectUrl = request.nextUrl.searchParams.get(
    "postLoginRedirectUrl",
  );

  // We need to perform this operation in a route since RSC doesn't allow us to set cookies directly
  if (postLoginRedirectUrl) {
    const redirectURL = new URL(postLoginRedirectUrl);
    cookies().set(
      postLoginRedirectUrlCookieName,
      `${redirectURL.pathname}${redirectURL.search}`,
      {
        expires: Date.now() + FIVE_MINUTES,
      },
    );
  }

  redirect(loginUrl ?? "/");
}
