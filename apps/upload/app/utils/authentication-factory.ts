import { BaseAuthenticationContext } from "auth/base-authentication-context";
import { getAuthenticationContextConfig } from "./logto-config";
import { Upload } from "building-blocks-sdk";

export class AuthenticationFactory {
  static getInstance(): BaseAuthenticationContext {
    return new BaseAuthenticationContext(getAuthenticationContextConfig());
  }

  static async getUploadClient(params?: {
    token?: string;
    authenticationContext?: BaseAuthenticationContext;
  }): Promise<Upload> {
    if (params?.token) {
      return new Upload(params.token);
    }
    if (params?.authenticationContext) {
      return new Upload(await params.authenticationContext.getAccessToken());
    }

    const token = await this.getInstance().getAccessToken();
    return new Upload(token);
  }
}
