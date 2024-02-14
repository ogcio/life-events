import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";
import { PgSessions } from "../../sessions";

export async function GET(request: Request) {
  const sessionCookie = cookies().get("sessionId");
  if (sessionCookie) {
    PgSessions.delete(sessionCookie.value);
    cookies().delete(sessionCookie.name);
  }
  redirect("http://mock-api.localtest.me/login/", RedirectType.replace);
}
