import { AuthSession } from "auth/auth-session";
import { getSignInConfiguration } from "../../../utils/logto-config";

export async function GET() {
  await AuthSession.login(getSignInConfiguration());
}
