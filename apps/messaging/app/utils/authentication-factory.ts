import { BaseAuthenticationContext } from "auth/base-authentication-context";
import { getAuthenticationContextConfig } from "./logto-config";
import { Messaging, Profile } from "building-blocks-sdk";
import { headers } from "next/headers";

export class AuthenticationFactory {
  static getInstance(): BaseAuthenticationContext {
    return new BaseAuthenticationContext(getAuthenticationContextConfig());
  }

  static async getToken(): Promise<string> {
    const cookieHeader = headers().get("cookie") as string;

    const res = await fetch(
      new URL(
        "/api/token",
        process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT as string,
      ),
      { headers: { cookie: cookieHeader } },
    );
    const { token } = await res.json();
    return token;
  }

  static async getMessagingClient(): Promise<Messaging> {
    const token = await this.getToken();
    return new Messaging(token);
  }

  static async getProfileClient(): Promise<Profile> {
    const token = await this.getToken();
    return new Profile(token);
  }
}
