import { BaseAuthenticationContext } from "auth/base-authentication-context";
import { getAuthenticationContextConfig } from "./logto-config";
import { Messaging } from "building-blocks-sdk";

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
}
