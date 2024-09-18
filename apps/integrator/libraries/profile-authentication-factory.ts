import { BaseAuthenticationContext } from "auth/base-authentication-context";
import { Profile } from "building-blocks-sdk";
import { headers } from "next/headers";
import { getProfileAuthenticationContextConfig } from "./logtoConfig";

export class ProfileAuthenticationFactory {
  static getInstance(organizationId: string): BaseAuthenticationContext {
    return new BaseAuthenticationContext(
      getProfileAuthenticationContextConfig(organizationId),
    );
  }

  static async getToken(organizationId: string): Promise<string> {
    // call a route handler that retrieves the cached token
    // we need to forward the cookie header or the request won't be authenticated
    const cookieHeader = headers().get("cookie") as string;

    const res = await fetch(
      new URL(
        `/api/profile-token?organizationId=${organizationId}`,
        process.env.NEXT_PUBLIC_INTEGRATOR_SERVICE_ENTRY_POINT as string,
      ),
      { headers: { cookie: cookieHeader } },
    );
    const { token } = await res.json();
    return token;
  }

  static async getProfileClient(organizationId: string): Promise<Profile> {
    const token = await this.getToken(organizationId);
    return new Profile(token);
  }
}
