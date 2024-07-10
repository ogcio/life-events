import { AuthSession } from "auth/auth-session";
import { getSignInConfiguration } from "../config";

export async function GET() {
  await AuthSession.login(getSignInConfiguration());
}
