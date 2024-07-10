import { AuthSession } from "auth/auth-session";
import { getBaseLogtoConfig } from "auth/authentication-context";

export async function GET() {
  await AuthSession.login(getBaseLogtoConfig());
}
