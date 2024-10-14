import { getAuthenticationContextConfig } from "./logtoConfig";
import { BaseAuthenticationContext } from "auth/base-authentication-context";
import { getSdks } from "./building-blocks-client";

export class AuthenticationFactory {
  static getInstance(): BaseAuthenticationContext {
    return new BaseAuthenticationContext(getAuthenticationContextConfig());
  }

  static async getPaymentsClient() {
    return getSdks().payments;
  }
}
