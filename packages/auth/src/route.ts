import { cookies } from "next/headers.js";
import { getPgSession } from "./sessions";
import { redirect, RedirectType } from "next/navigation.js";

enum SAME_SITE_VALUES {
  LAX = "lax",
  NONE = "none",
}

function getSessionIdCookieConfig(req: Request, cookieValue: string) {
  const cookieConfig = {
    name: "sessionId",
    value: cookieValue,
    httpOnly: true,
    secure: false,
    path: "/",
  };
  const url = new URL(process.env.HOST_URL ?? req.url);
  if (url.protocol === "https:") {
    return {
      ...cookieConfig,
      secure: true,
      sameSite: SAME_SITE_VALUES.NONE,
    };
  }

  return {
    ...cookieConfig,
    sameSite: SAME_SITE_VALUES.LAX,
  };
}

export default async (req: Request) => {
  const formData = await req.formData();
  const sessionId = formData.get("sessionId")?.toString() ?? "";

  const authServiceUrl = process.env.AUTH_SERVICE_URL;

  const loginUrl = `${authServiceUrl}/auth?redirectUrl=${process.env.HOST_URL}`;
  if (!sessionId) {
    return redirect(loginUrl, RedirectType.replace);
  }

  const session = await getPgSession(sessionId); //PgSessions.get(sessionId);

  if (!session) {
    return redirect(loginUrl, RedirectType.replace);
  }

  cookies().set(getSessionIdCookieConfig(req, sessionId));
  const { publicServant } = session;

  if (publicServant) {
    return redirect("/admin", RedirectType.replace);
  }

  return redirect("/", RedirectType.replace);
};
