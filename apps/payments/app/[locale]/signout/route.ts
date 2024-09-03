import { AuthSession } from "auth/auth-session";
import logtoConfig, {
  logtoUserIdCookieName,
  postSignoutRedirect,
} from "../../../libraries/logtoConfig";
import { cookies } from "next/headers";

export async function GET() {
  /**
   * This cookie stores the user's ID for testing purposes in our E2E tests.
   * Once the user logs out, this information becomes stale, and it has to be removed.
   */
  cookies().delete(logtoUserIdCookieName);
  await AuthSession.logout(logtoConfig, postSignoutRedirect);
}
