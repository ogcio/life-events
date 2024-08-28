import { AuthSession } from "auth/auth-session";
import logtoConfig, {
  logtoUserIdCookieName,
  postSignoutRedirect,
} from "../../../libraries/logtoConfig";
import { cookies } from "next/headers";

export async function GET() {
  cookies().delete(logtoUserIdCookieName);
  await AuthSession.logout(logtoConfig, postSignoutRedirect);
}
