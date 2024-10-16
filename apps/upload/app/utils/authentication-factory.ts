import { BaseAuthenticationContext } from "auth/base-authentication-context";
import { getAuthenticationContextConfig } from "./logto-config";
import { Upload, Profile } from "building-blocks-sdk";
import { headers } from "next/headers";
import { getServerLogger } from "nextjs-logging-wrapper";

export class AuthenticationFactory {
  static getInstance(): BaseAuthenticationContext {
    return new BaseAuthenticationContext(getAuthenticationContextConfig());
  }

  static async getToken(): Promise<string> {
    // call a route handler that retrieves the cached token
    // we need to forward the cookie header or the request won't be authenticated
    const cookieHeader = headers().get("cookie") as string;
    try {
      const res = await fetch(new URL("/api/token", process.env.HOST_URL), {
        headers: { cookie: cookieHeader },
      });
      const { token } = await res.json();
      return token;
    } catch (err) {
      getServerLogger().error("error fetch token upload client", err);
    }
    return "";
  }

  static async getUploadClient(): Promise<Upload> {
    const token = await this.getToken();

    return new Upload(token);
  }

  static async getProfileClient(): Promise<Profile> {
    const token = await this.getToken();

    return new Profile(token);
  }
}
