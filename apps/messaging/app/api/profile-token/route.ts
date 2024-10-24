import { NextResponse } from "next/server";
import { ProfileAuthenticationFactory } from "../../utils/profile-authentication-factory";
import { getCommonLoggerWithEnvLevel } from "../../utils/messaging";

// retrieve the token in a route handler so Logto can cache the token by setting the cookie
export async function GET() {
  try {
    const token = await ProfileAuthenticationFactory.getInstance().getToken();

    getCommonLoggerWithEnvLevel().trace(
      {
        subToken:
          token && typeof token === "string" ? token.substring(0, 10) : token,
      },
      "Token retrieved in /api/profile-token",
    );

    return NextResponse.json({ token });
  } catch (error) {
    getCommonLoggerWithEnvLevel().error(
      { error },
      "Error raised requesting token in /api/profile-token",
    );

    throw error;
  }
}
