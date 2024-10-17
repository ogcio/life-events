import { BaseAuthenticationContext } from "auth/base-authentication-context";
import { getAuthenticationContextConfig } from "./logto-config";
import { headers } from "next/headers";
import { getSdks } from "./building-blocks-client";

export class AuthenticationFactory {
  static getInstance(): BaseAuthenticationContext {
    console.log({ baseC: getAuthenticationContextConfig() });

    return new BaseAuthenticationContext(getAuthenticationContextConfig());
  }

  // static async getToken(): Promise<string> {
  //   // call a route handler that retrieves the cached token
  //   // we need to forward the cookie header or the request won't be authenticated
  //   const cookieHeader = headers().get("cookie") as string;

  //   const res = await fetch(new URL("/api/token", process.env.HOST_URL), {
  //     headers: { cookie: cookieHeader },
  //   });
  //   const { token } = await res.json();
  //   return token;
  // }

  static async getUploadClient() {
    return getSdks().upload;
  }
}
