import { AuthSession } from "auth/auth-session";
import logtoConfig, { postSignoutRedirect } from "../config";

export async function GET() {
  await AuthSession.logout(logtoConfig, postSignoutRedirect);
}
