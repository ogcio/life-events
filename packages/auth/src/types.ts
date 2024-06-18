import { LogtoContext, LogtoNextConfig, UserScope } from "@logto/next";
import { getLogtoContext } from "@logto/next/server-actions";

export type GovIdJwtPayload = {
  surname: string;
  givenName: string;
  email: string;
  BirthDate: string;
  PublicServiceNumber: string;
  DSPOnlineLevel: string;
  mobile: string;
};

export type SessionTokenDecoded = {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  publicServiceNumber: string;
};

export type Session = {
  token: string;
  userId: string;
};

export type AuthConfig = LogtoNextConfig;
export type AuthSessionContext = LogtoContext;

export type GetSessionContextParameters = {
  fetchUserInfo?: boolean;
  getAccessToken?: boolean;
  organizationId?: string;
  resource?: string;
  getOrganizationToken?: boolean;
};

export interface Sessions {
  get(redirectUrl?: string): Promise<
    SessionTokenDecoded & {
      userId: string;
      publicServant: boolean;
      verificationLevel: number;
      sessionId: string;
    }
  >;
  isAuthenticated(): Promise<boolean>;
}

export type IAuthSession = {
  login(config: AuthConfig): Promise<void>;
  logout(config: AuthConfig, redirectUri?: string): Promise<void>;
  get(
    config: AuthConfig,
    getContextParameters?: GetSessionContextParameters,
  ): Promise<AuthSessionContext>;
  isAuthenticated(
    config: AuthConfig,
    getContextParameters?: GetSessionContextParameters,
  ): Promise<boolean>;
};
