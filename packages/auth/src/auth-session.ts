import {
  LogtoContext,
  getLogtoContext,
  signIn,
  signOut,
} from "@logto/next/server-actions";
import {
  IAuthSession,
  GetSessionContextParameters,
  PartialAuthSessionContext,
  AuthSessionUserInfo,
  AuthSessionOrganizationInfo,
} from "./types";
import { redirect } from "next/navigation";
import { LogtoNextConfig, UserScope } from "@logto/next";
import { BadRequestError } from "shared-errors";
import { decodeJwt } from "jose";
import { getCommonLogger } from "nextjs-logging-wrapper";
import { cookies } from "next/headers";

const PROCESS_ERROR = "PARSE_LOGTO_CONTEXT";

const INACTIVE_PUBLIC_SERVANT_ORG_ROLE =
  "inactive-ps-org:Inactive Public Servant";
const INACTIVE_PUBLIC_SERVANT_SCOPE = "bb:public-servant.inactive:*";

const DEFAULT_ORGANIZATION_ID = "ogcio";

const DEFAULT_ORG_COOKIE = "bb-default-org-id";

export const AuthUserScope = UserScope;

export const AuthSession: IAuthSession = {
  async login(config) {
    addInactivePublicServantScope(config);
    return signIn(config);
  },
  async logout(config, redirectUri) {
    addInactivePublicServantScope(config);
    return signOut(config, redirectUri);
  },
  async get(
    config: LogtoNextConfig,
    getContextParameters: GetSessionContextParameters,
  ): Promise<PartialAuthSessionContext> {
    if (
      getContextParameters.userType === "publicServant" &&
      !getContextParameters.organizationId
    ) {
      throw new BadRequestError(
        PROCESS_ERROR,
        "Organization id is mandatory when logging in as public servant",
      );
    }
    addInactivePublicServantScope(config);
    let context;
    try {
      context = await getLogtoContext(config, getContextParameters);
    } catch (err) {
      getCommonLogger().error(err);
      redirect(getContextParameters?.loginUrl ?? "/logto_integration/login");
    }

    if (!context.isAuthenticated) {
      redirect(getContextParameters?.loginUrl ?? "/logto_integration/login");
    }

    try {
      return parseContext(context, getContextParameters);
    } catch (err) {
      getCommonLogger().error(err);
      redirect(getContextParameters?.loginUrl ?? "/logto_integration/login");
    }
  },
  async isAuthenticated(config, getContextParameters) {
    addInactivePublicServantScope(config);
    const context = await getLogtoContext(config, getContextParameters);

    return context.isAuthenticated;
  },
  getDefaultOrganization(
    storageGetFn: (name: string) =>
      | {
          name: string;
          value: string;
        }
      | undefined,
  ): string | undefined {
    return storageGetFn(DEFAULT_ORG_COOKIE)?.value;
  },
  setDefaultOrganization(
    organizationId: string,
    storageSetFn: (name, value) => void,
  ): string {
    storageSetFn(DEFAULT_ORG_COOKIE, organizationId);
    return organizationId;
  },
};

const addInactivePublicServantScope = (config) => {
  if (config.scopes && !config.scopes.includes(INACTIVE_PUBLIC_SERVANT_SCOPE)) {
    config.scopes.push(INACTIVE_PUBLIC_SERVANT_SCOPE);
  }
};

const getUserInfo = (
  context: LogtoContext,
): AuthSessionUserInfo | undefined => {
  let name: string | null = null;
  let username: string | null = null;
  let id: string | null = null;
  let email: string | null = null;

  if (context.claims) {
    name = context.claims.name ?? null;
    username = context.claims.username ?? null;
    id = context.claims.sub;
    email = context.claims.email ?? null;
  }

  if (context.userInfo) {
    name = name ?? context.userInfo.name ?? null;
    username = username ?? context.userInfo.username ?? null;
    id = context.userInfo.sub;
    email = email ?? context.userInfo.email ?? null;
  }

  if (id === null || (name === null && username === null && email === null)) {
    return undefined;
  }

  const organizationData = (context.userInfo?.organization_data ?? []).sort(
    (orgA, orgB) => {
      if (orgA.id === DEFAULT_ORGANIZATION_ID) {
        return -1;
      }

      if (orgB.id === DEFAULT_ORGANIZATION_ID) {
        return 1;
      }

      return orgA.name.localeCompare(orgB.name);
    },
  );

  return {
    name,
    username,
    id,
    email,
    organizationRoles: context.userInfo?.organization_roles,
    organizations: context.userInfo?.organizations,
    organizationData,
  };
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

const getOrganizationInfo = (
  context: WithOrgDataContext,
  getContextParameters: GetSessionContextParameters | undefined,
  organizationRoles: string[] | null,
): AuthSessionOrganizationInfo | undefined => {
  if (organizationRoles === null || organizationRoles.length === 0) {
    return undefined;
  }

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

  for (const currentOrg of context.userInfo.organization_data) {
    if (currentOrg.id === getContextParameters.organizationId) {
      return {
        id: currentOrg.id,
        name: currentOrg.name,
        roles: organizationRoles,
      };
    }
  }

  return undefined;
};

const getOrganizationRoles = (context: LogtoContext): string[] | null => {
  let organizationRoles: Set<string> | null = null;

  if (context.claims && Array.isArray(context.claims.organization_roles)) {
    organizationRoles = new Set<string>(context.claims.organization_roles);
  }

  if (context.userInfo && Array.isArray(context.userInfo.organization_roles)) {
    if (organizationRoles === null) {
      organizationRoles = new Set<string>();
    }

    organizationRoles = new Set<string>([
      ...Array.from(organizationRoles),
      ...context.userInfo.organization_roles,
    ]);
  }

  return organizationRoles ? Array.from(organizationRoles) : null;
};

const checkIfPublicServant = (
  orgRoles: string[] | null,
  getContextParameters: GetSessionContextParameters,
): boolean => {
  if (checkIfInactivePublicServant(orgRoles) || orgRoles === null) {
    return false;
  }

  return orgRoles.some((orgRole) => {
    const [_, role] = orgRole.split(":");
    return role === getContextParameters.publicServantExpectedRole;
  });
};

const checkIfInactivePublicServant = (orgRoles: string[] | null): boolean =>
  orgRoles !== null && orgRoles?.includes(INACTIVE_PUBLIC_SERVANT_ORG_ROLE);

const getAccessToken = (
  context: LogtoContext,
  orgInfo: AuthSessionOrganizationInfo | undefined,
  isPublicServant: boolean,
  getContextParameters: GetSessionContextParameters,
): string | undefined => {
  if (
    !orgInfo ||
    !isPublicServant ||
    getContextParameters.userType === "citizen"
  ) {
    return context.accessToken;
  }

  if (!context.organizationTokens || !context.organizationTokens[orgInfo.id]) {
    throw new BadRequestError(
      PROCESS_ERROR,
      "Cannot find an organization token for the requested organization",
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

  return decoded.scope.split(" ").filter((s) => s != "");
};

const parseContext = (
  context: LogtoContext,
  getContextParameters: GetSessionContextParameters,
): PartialAuthSessionContext => {
  const userInfo = getUserInfo(context);
  const orgRoles = getOrganizationRoles(context);
  const orgInfo = getOrganizationInfo(context, getContextParameters, orgRoles);
  const isPublicServant = checkIfPublicServant(orgRoles, getContextParameters);
  const isInactivePublicServant = checkIfInactivePublicServant(orgRoles);

  const accessToken = getAccessToken(
    context,
    orgInfo,
    isPublicServant,
    getContextParameters,
  );

  const outputContext: PartialAuthSessionContext = {
    isPublicServant,
    isInactivePublicServant,
    scopes: getScopes(context, isPublicServant, accessToken),
  };

  if (userInfo) {
    outputContext.user = userInfo;
  }
  if (orgInfo) {
    outputContext.organization = orgInfo;
  }
  if (accessToken) {
    outputContext.accessToken = accessToken;
  }
  if (getContextParameters.includeOriginalContext) {
    outputContext.originalContext = context;
  }

  return outputContext;
};
