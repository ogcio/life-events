import { LogtoContext, LogtoNextConfig, UserScope } from "@logto/next";

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

export type AuthSessionUserInfo = {
  name: string | null;
  username: string | null;
  id: string;
  email: string | null;
};

export type AuthSessionOrganizationInfo = {
  id: string;
  name: string;
  roles: string[];
};

export type AuthSessionContext = {
  user?: AuthSessionUserInfo;
  isPublicServant: boolean;
  organization?: AuthSessionOrganizationInfo;
  originalContext?: LogtoContext;
  scopes: string[];
  accessToken?: string;
};

export type GetSessionContextParameters = {
  fetchUserInfo?: boolean;
  getAccessToken?: boolean;
  organizationId?: string;
  resource?: string;
  getOrganizationToken?: boolean;
  loginUrl?: string;
  publicServantExpectedRole: string;
  userType: "citizen" | "publicServant";
  includeOriginalContext?: boolean;
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
    getContextParameters: GetSessionContextParameters,
  ): Promise<AuthSessionContext>;
  isAuthenticated(
    config: AuthConfig,
    getContextParameters?: GetSessionContextParameters,
  ): Promise<boolean>;
};
