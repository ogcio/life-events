import { Payments } from "building-blocks-sdk";
import { getAuthenticationContextConfig } from "./logtoConfig";
import { BaseAuthenticationContext } from "auth/base-authentication-context";

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

    const token = await this.getInstance().getAccessToken();

    return new Payments(token);
  }
}
