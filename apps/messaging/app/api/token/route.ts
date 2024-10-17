import { NextResponse } from "next/server";
import { AuthenticationFactory } from "../../utils/authentication-factory";
import {
  getCommonLoggerWithEnvLevel,
  isValidJson,
} from "../../utils/messaging";

// retrieve the token in a route handler so Logto can cache the token by setting the cookie
export async function GET() {
  try {
    const token = await AuthenticationFactory.getInstance().getToken();
    const isJson = isValidJson(token);
    if (!isJson) {
      getCommonLoggerWithEnvLevel().warn(
        { retrievedToken: token },
        "The token retrieved in /api/token is not valid",
      );
      throw new Error(
        `The token retrieved in /api/token is not a valid JSON: ${token}`,
      );
    }

    getCommonLoggerWithEnvLevel().trace(
      {
        subToken:
          token && typeof token === "string" ? token.substring(0, 10) : token,
      },
      "Token retrieved in /api/token",
    );

    return NextResponse.json({ token });
  } catch (error) {
    getCommonLoggerWithEnvLevel().error(
      { error },
      "Error raised requesting token in /api/token",
    );

    throw error;
  }
}
