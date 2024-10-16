import { AuthSession } from "auth/auth-session";
import {
  getSignInConfiguration,
  postSignoutRedirect,
} from "../../../utils/authentication-factory";

export async function GET() {
  await AuthSession.logout(getSignInConfiguration(), postSignoutRedirect);
}
