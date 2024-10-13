import { BaseAuthenticationContext } from "auth/base-authentication-context";
import { getAuthenticationContextConfig } from "./logto-config";
import { getSdks } from "./building-blocks-client";

export class AuthenticationFactory {
  static getInstance(): BaseAuthenticationContext {
    return new BaseAuthenticationContext(getAuthenticationContextConfig());
  }

  static async getMessagingClient() {
    return getSdks().messaging;
  }
}
