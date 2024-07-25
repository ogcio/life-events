import { BaseAuthenticationContext } from "auth/base-authentication-context";
import { getAuthenticationContextConfig } from "./logto-config";
import { Messaging, Profile } from "building-blocks-sdk";

export class AuthenticationFactory {
  static getInstance(): BaseAuthenticationContext {
    return new BaseAuthenticationContext(getAuthenticationContextConfig());
  }

  static async getMessagingClient(params?: {
    token?: string;
    authenticationContext?: BaseAuthenticationContext;
  }): Promise<Messaging> {
    if (params?.token) {
      return new Messaging(params.token);
    }
    if (params?.authenticationContext) {
      return new Messaging(await params.authenticationContext.getAccessToken());
    }

    const token = await this.getInstance().getAccessToken();

    return new Messaging(token);
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
