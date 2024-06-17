import { AuthSession } from "auth/auth-session";
import logtoConfig from "../config";

export async function GET() {
  await AuthSession.login(logtoConfig);
}
