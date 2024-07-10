import { AuthSession } from "auth/auth-session";
import { getSignInConfiguration, postSignoutRedirect } from "../config";

export async function GET() {
  await AuthSession.logout(getSignInConfiguration(), postSignoutRedirect);
}
