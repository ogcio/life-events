import { BaseAuthenticationContext } from "auth/base-authentication-context";
import { getAuthenticationContextConfig } from "./logto-config";

export class AuthenticationFactory {
  static getInstance(): BaseAuthenticationContext {
    return new BaseAuthenticationContext(getAuthenticationContextConfig());
  }
}
