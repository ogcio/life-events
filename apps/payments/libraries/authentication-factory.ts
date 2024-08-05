import { Payments } from "building-blocks-sdk";
import { getAuthenticationContextConfig } from "./logtoConfig";
import { BaseAuthenticationContext } from "auth/base-authentication-context";
import { headers } from "next/headers";

export class AuthenticationFactory {
  static getInstance(): BaseAuthenticationContext {
    return new BaseAuthenticationContext(getAuthenticationContextConfig());
  }

  static async getPaymentsClient(): Promise<Payments> {
    // call a route handler that retrieves the cached token
    // we need to forward the cookie header or the request won't be authenticated
    const cookieHeader = headers().get("cookie") as string;

    const res = await fetch(
      new URL(
        "/api/token",
        process.env.NEXT_PUBLIC_PAYMENTS_SERVICE_ENTRY_POINT as string,
      ),
      { headers: { cookie: cookieHeader } },
    );
    const { token } = await res.json();

    return new Payments(token);
  }
}
