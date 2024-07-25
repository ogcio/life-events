import { BaseAuthenticationContext } from "auth/base-authentication-context";
import { getAuthenticationContextConfig } from "./logto-config";
import { Profile } from "building-blocks-sdk";

export class AuthenticationFactory {
  static getInstance(): BaseAuthenticationContext {
    return new BaseAuthenticationContext(getAuthenticationContextConfig());
  }

  static async getProfileClient(params?: {
    token?: string;
    authenticationContext?: BaseAuthenticationContext;
  }): Promise<Profile> {
    if (params?.token) {
      return new Profile(params.token);
    }
    if (params?.authenticationContext) {
      return new Profile(await params.authenticationContext.getAccessToken());
    }

    const token = await this.getInstance().getAccessToken();

    return new Profile(token);
  }
}