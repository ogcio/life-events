import { AuthSession } from "auth/auth-session";
import { getSignInConfiguration } from "../../../../libraries/logtoConfig";

export async function GET() {
  await AuthSession.login(getSignInConfiguration());
}
