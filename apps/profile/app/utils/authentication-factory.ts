import { BaseAuthenticationContext } from "auth/base-authentication-context";
import { getAuthenticationContextConfig } from "./logto-config";
import { Profile } from "building-blocks-sdk";
import { headers } from "next/headers";

export class AuthenticationFactory {
  static getInstance(): BaseAuthenticationContext {
    return new BaseAuthenticationContext(getAuthenticationContextConfig());
  }

  static async getProfileClient(): Promise<Profile> {
    // call a route handler that retrieves the cached token
    // we need to forward the cookie header or the request won't be authenticated
    const cookieHeader = headers().get("cookie") as string;

    const res = await fetch(
      new URL("/api/token", process.env.HOST_URL as string),
      { headers: { cookie: cookieHeader } },
    );
    const { token } = await res.json();

    return new Profile(token);
  }
}
