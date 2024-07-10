import { AuthSession } from "auth/auth-session";
import logtoConfig from "../../../libraries/logtoConfig";

export async function GET() {
  await AuthSession.login(logtoConfig);
}
