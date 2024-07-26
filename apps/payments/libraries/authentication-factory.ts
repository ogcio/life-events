import { Payments } from "building-blocks-sdk";
import { getAuthenticationContextConfig } from "./logtoConfig";
import { BaseAuthenticationContext } from "auth/base-authentication-context";
import { headers } from "next/headers";

export class AuthenticationFactory {
  static getInstance(): BaseAuthenticationContext {
    return new BaseAuthenticationContext(getAuthenticationContextConfig());
  }

  static async getPaymentsClient(params?: {
    token?: string;
    authenticationContext?: BaseAuthenticationContext;
  }): Promise<Payments> {
    if (params?.token) {
      return new Payments(params.token);
    }
    if (params?.authenticationContext) {
      return new Payments(await params.authenticationContext.getAccessToken());
    }

    const res = await fetch(
      new URL("/api/token", process.env.NEXT_PUBLIC_HOST_URL as string),
      { headers: headers() },
    );
    const { token } = await res.json();

    return new Payments(token);
  }
}
