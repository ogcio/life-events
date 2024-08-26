import { BaseAuthenticationContext } from "auth/base-authentication-context";
import { getAuthenticationContextConfig } from "./logto-config";
import { Upload } from "building-blocks-sdk";
import { headers } from "next/headers";

export class AuthenticationFactory {
  static getInstance(): BaseAuthenticationContext {
    return new BaseAuthenticationContext(getAuthenticationContextConfig());
  }

  static async getToken(): Promise<string> {
    // call a route handler that retrieves the cached token
    // we need to forward the cookie header or the request won't be authenticated
    const cookieHeader = headers().get("cookie") as string;

    const res = await fetch(new URL("/api/token", process.env.HOST_URL), {
      headers: { cookie: cookieHeader },
    });
    const { token } = await res.json();
    return token;
  }

  static async getUploadClient(): Promise<Upload> {
    const token = await this.getToken();

    return new Upload(token);
  }
}
