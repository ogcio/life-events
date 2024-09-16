import { AuthSession } from "auth/auth-session";
import {
  getSignInConfiguration,
  postSignoutRedirect,
} from "../../../utils/logto-config";

export async function GET() {
  await AuthSession.logout(getSignInConfiguration(), postSignoutRedirect);
}
