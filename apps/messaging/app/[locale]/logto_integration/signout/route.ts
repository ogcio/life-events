import { AuthSession } from "auth/auth-session";
import { postSignoutRedirect } from "../config";
import { getBaseLogtoConfig } from "auth/authentication-context";

export async function GET() {
  await AuthSession.logout(getBaseLogtoConfig(), postSignoutRedirect);
}
