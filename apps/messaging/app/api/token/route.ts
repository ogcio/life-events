import { NextResponse } from "next/server";
import { AuthenticationFactory } from "../../utils/authentication-factory";
import {
  getCommonLoggerWithEnvLevel,
  isValidJson,
} from "../../utils/messaging";

// retrieve the token in a route handler so Logto can cache the token by setting the cookie
export async function GET() {
  const token = await AuthenticationFactory.getInstance().getToken();
  const isJson = isValidJson(token);
  if (!isJson) {
    getCommonLoggerWithEnvLevel().warn(
      { retrievedToken: token },
      "The token retrieved in /api/token is not valid",
    );
  }

  return NextResponse.json({ token });
}
