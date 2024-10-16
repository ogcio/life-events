import { NextResponse } from "next/server";
import { ProfileAuthenticationFactory } from "../../utils/profile-authentication-factory";
import {
  getCommonLoggerWithEnvLevel,
  isValidJson,
} from "../../utils/messaging";

// retrieve the token in a route handler so Logto can cache the token by setting the cookie
export async function GET() {
  const token = await ProfileAuthenticationFactory.getInstance().getToken();
  const isJson = isValidJson(token);
  if (!isJson) {
    getCommonLoggerWithEnvLevel().trace(
      { retrievedToken: token },
      "The token retrieved in /api/profile-token is not valid",
    );
  }
  return NextResponse.json({ token });
}
