import { BaseAuthenticationContext } from "auth/base-authentication-context";
import { getProfileAuthenticationContextConfig } from "./logto-config";
import { getSdks } from "./building-blocks-client";

export class ProfileAuthenticationFactory {
  static getInstance(): BaseAuthenticationContext {
    return new BaseAuthenticationContext(
      getProfileAuthenticationContextConfig(),
    );
  }

  static async getProfileClient() {
    return getSdks().profile;
  }
}
