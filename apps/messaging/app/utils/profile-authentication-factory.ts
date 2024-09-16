import { BaseAuthenticationContext } from "auth/base-authentication-context";
import { getProfileAuthenticationContextConfig } from "./logto-config";
import { Profile } from "building-blocks-sdk";
import { headers } from "next/headers";

export class ProfileAuthenticationFactory {
  static getInstance(): BaseAuthenticationContext {
    return new BaseAuthenticationContext(
      getProfileAuthenticationContextConfig(),
    );
  }

  static async getToken(): Promise<string> {
    // call a route handler that retrieves the cached token
    // we need to forward the cookie header or the request won't be authenticated
    const cookieHeader = headers().get("cookie") as string;

    const res = await fetch(
      new URL(
        "/api/profile-token",
        process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT as string,
      ),
      { headers: { cookie: cookieHeader } },
    );
    const { token } = await res.json();
    return token;
  }

  static async getProfileClient(): Promise<Profile> {
    const token = await this.getToken();
    return new Profile(token);
  }
}
