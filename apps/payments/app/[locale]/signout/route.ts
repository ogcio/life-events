import { AuthSession } from "auth/auth-session";
import logtoConfig, {
  postSignoutRedirect,
} from "../../../libraries/logtoConfig";

export async function GET() {
  await AuthSession.logout(logtoConfig, postSignoutRedirect);
}
