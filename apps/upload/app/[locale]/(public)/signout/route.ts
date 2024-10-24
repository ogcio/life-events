import { AuthSession } from "auth/auth-session";
import {
  getSignInConfiguration,
  postSignoutRedirect,
} from "../../../utils/logto-config";
import { getSdks } from "../../../utils/building-blocks-client";

export async function GET() {
  getSdks().upload.deleteToken();
  await AuthSession.logout(getSignInConfiguration(), postSignoutRedirect);
}
