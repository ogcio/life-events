import { AuthSession } from "auth/auth-session";
import { getSignInConfiguration } from "../../../utils/authentication-factory";

export async function GET() {
  await AuthSession.login(getSignInConfiguration());
}
