import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";
import { PgSessions } from "auth/sessions";

export async function GET(request: Request) {
  const sessionCookie = cookies().get("sessionId");
  if (sessionCookie) {
    PgSessions.delete(sessionCookie.value);
    cookies().delete(sessionCookie.name);
  }

  const loginUrl = process.env.LOGIN_URL;

  if (!loginUrl) {
    throw Error("Missing env var LOGIN_URL");
  }

  const url = new URL(loginUrl);
  url.searchParams.append('return_url', new URL('/en/api/auth', process.env.HOST_URL).href);

  redirect(url.href, RedirectType.replace);
}
