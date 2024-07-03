import {
  LogtoContext,
  getLogtoContext,
  signIn,
  signOut,
} from "@logto/next/server-actions";
import {
  IAuthSession,
  GetSessionContextParameters,
  AuthSessionContext,
  AuthSessionUserInfo,
  AuthSessionOrganisationInfo,
} from "./types";
import { redirect } from "next/navigation";
import { LogtoNextConfig, UserScope } from "@logto/next";
import { BadRequestError } from "shared-errors";
import { decodeJwt } from "jose";

const PROCESS_ERROR = "PARSE_LOGTO_CONTEXT";

export const AuthUserScope = UserScope;

export const AuthSession: IAuthSession = {
  async login(config) {
    return signIn(config);
  },
  async logout(config, redirectUri) {
    return signOut(config, redirectUri);
  },
  async get(
    config: LogtoNextConfig,
    getContextParameters: GetSessionContextParameters,
  ): Promise<AuthSessionContext> {
    const context = await getLogtoContext(config, getContextParameters);

    if (!context.isAuthenticated) {
      redirect(getContextParameters?.loginUrl ?? "/logto_integration/login");
    }

    return parseContext(context, getContextParameters);
  },
  async isAuthenticated(config, getContextParameters) {
    const context = await getLogtoContext(config, getContextParameters);

    return context.isAuthenticated;
  },
};

const getUserInfo = (
  context: LogtoContext,
): AuthSessionUserInfo | undefined => {
  let name: string | null = null;
  let username: string | null = null;
  if (context.claims) {
    name = context.claims.name ?? null;
    username = context.claims.username ?? null;
  }

  if (context.userInfo) {
    name = name ?? context.userInfo.name ?? null;
    username = username ?? context.userInfo.username ?? null;
  }

  if (name === null && username === null) {
    return undefined;
  }

  return { name, username };
};
// waiting for https://github.com/logto-io/js/issues/758
// to be resolved
type WithOrgDataUserInfo =
  | (
      | (LogtoContext["userInfo"] & {
          organization_data?: {
            id: string;
            name: string;
            description: string;
          }[];
        })
      | undefined
    )
  | undefined;
type WithOrgDataContext = Omit<LogtoContext, "userInfo"> & {
  userInfo?: WithOrgDataUserInfo;
};

const getOrganisationInfo = (
  context: WithOrgDataContext,
  getContextParameters: GetSessionContextParameters | undefined,
): AuthSessionOrganisationInfo | undefined => {
  if (
    !getContextParameters?.organizationId ||
    !context.userInfo?.organization_data
  ) {
    return undefined;
  }

  if (
    !context.userInfo?.organizations?.includes(
      getContextParameters.organizationId,
    )
  ) {
    return undefined;
  }

  const organisationRoles = getOrganisationRoles(context);
  if (organisationRoles === null || organisationRoles.length === 0) {
    return undefined;
  }

  for (const currentOrg of context.userInfo.organization_data) {
    if (currentOrg.id === getContextParameters.organizationId) {
      return {
        id: currentOrg.id,
        name: currentOrg.name,
        roles: organisationRoles,
      };
    }
  }

  return undefined;
};

const getOrganisationRoles = (context: LogtoContext): string[] | null => {
  let organisationRoles: string[] | null = null;

  if (context.claims && Array.isArray(context.claims.organization_roles)) {
    organisationRoles = context.claims.organization_roles;
  }

  if (context.userInfo && Array.isArray(context.userInfo.organization_roles)) {
    if (organisationRoles === null) {
      organisationRoles = [];
    }

    organisationRoles.push(...context.userInfo.organization_roles);
  }

  return organisationRoles;
};

const checkIfPublicServant = (
  orgInfo: AuthSessionOrganisationInfo | undefined,
  getContextParameters: GetSessionContextParameters,
): boolean => {
  return (
    orgInfo !== undefined &&
    orgInfo.roles.includes(getContextParameters.publicServantExpectedRole)
  );
};

const getAccessToken = (
  context: LogtoContext,
  orgInfo: AuthSessionOrganisationInfo | undefined,
  isPublicServant: boolean,
): string | undefined => {
  if (!orgInfo || !isPublicServant) {
    return context.accessToken;
  }

  if (!context.organizationTokens || !context.organizationTokens[orgInfo.id]) {
    throw new BadRequestError(
      PROCESS_ERROR,
      "Cannot find an organisation token for the requested organisation",
    );
  }

  return context.organizationTokens[orgInfo.id];
};

const getScopes = (
  context: LogtoContext,
  isPublicServant: boolean,
  token: string | undefined,
): string[] => {
  if (!isPublicServant) {
    return (context.scopes ?? []).filter((s) => s != "");
  }

  if (!token) {
    return [];
  }

  const decoded = decodeJwt<{ scope: string }>(token);

  return decoded.scope.split(" ");
};

const parseContext = (
  context: LogtoContext,
  getContextParameters: GetSessionContextParameters,
): AuthSessionContext => {
  const userInfo = getUserInfo(context);
  const orgInfo = getOrganisationInfo(context, getContextParameters);
  const isPublicServant = checkIfPublicServant(orgInfo, getContextParameters);
  const accessToken = getAccessToken(context, orgInfo, isPublicServant);

  const outputContext: AuthSessionContext = {
    originalContext: context,
    isPublicServant,
    scopes: getScopes(context, isPublicServant, accessToken),
  };

  if (userInfo) {
    outputContext.user = userInfo;
  }
  if (orgInfo) {
    outputContext.organisation = orgInfo;
  }
  if (accessToken) {
    outputContext.accessToken = accessToken;
  }

  return outputContext;
};
