import { RedirectType, redirect } from "next/navigation.js";
import { getPgSession } from "./sessions.js";
import { getSessionIdCookieConfig } from "./route.js";
import { cookies } from "next/headers.js";

export default async (req: Request) => {
  const formData = await req.formData();
  const sessionId = formData.get("sessionId")?.toString() ?? "";

  const authServiceUrl = process.env.AUTH_SERVICE_URL;

  const loginUrl = `${authServiceUrl}/auth?redirectUrl=${process.env.HOST_URL}`;

  if (!sessionId) {
    return redirect(loginUrl, RedirectType.replace);
  }

  const session = await getPgSession(sessionId); //PgSessions.get(sessionId);

  cookies().set(getSessionIdCookieConfig(req, sessionId));

  if (!session) {
    return redirect(loginUrl, RedirectType.replace);
  }

  const { publicServant } = session;

  if (publicServant) {
    return redirect("/admin", RedirectType.replace);
  }

  return redirect("/", RedirectType.replace);
};
