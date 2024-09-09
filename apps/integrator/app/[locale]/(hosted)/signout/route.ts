import { AuthSession } from "auth/auth-session";
import {
  getSignInConfiguration,
  postSignoutRedirect,
} from "../../../../libraries/logtoConfig";

export async function GET() {
  await AuthSession.logout(getSignInConfiguration(), postSignoutRedirect);
}
