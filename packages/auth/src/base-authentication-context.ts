import {
  AuthSessionContext,
  AuthSessionUserInfo,
  OrganizationData,
  PartialAuthSessionContext,
} from "./types";
import {
  getCitizenContext,
  getSelectedOrganization,
  getPublicServantContext,
  isPublicServantAuthenticated,
  setSelectedOrganization,
  getCitizenToken,
  getOrgToken,
  isAuthenticated,
} from "./authentication-context";
import { notFound } from "next/navigation";
import { getCommonLogger } from "nextjs-logging-wrapper";
import createError from "http-errors";

export interface AuthenticationContextConfig {
  resourceUrl?: string;
  citizenScopes: string[];
  publicServantScopes: string[];
  organizationId?: string;
  loginUrl: string;
  publicServantExpectedRoles: string[];
  baseUrl: string;
  appId: string;
  appSecret: string;
}

export class BaseAuthenticationContext {
  readonly config: AuthenticationContextConfig;
  sharedContext: AuthSessionContext | null = null;
  citizenContext: PartialAuthSessionContext | null = null;
  publicServantContext: PartialAuthSessionContext | null = null;

  constructor(config: AuthenticationContextConfig) {
    this.config = config;
  }

  async getContext() {
    if (!this.sharedContext) {
      let context = await this.getCitizen();
      if (context.isPublicServant) {
        context = await this.getPublicServant();
      }

      this.sharedContext = this.ensureIsFullContext(context);
    }

    return this.sharedContext;
  }

  async getCitizen() {
    if (!this.citizenContext) {
      this.citizenContext =
        this.sharedContext && !this.sharedContext.isPublicServant
          ? this.sharedContext
          : await getCitizenContext(this.config);
    }
    return this.citizenContext as PartialAuthSessionContext;
  }

  async getPublicServant() {
    if (!this.publicServantContext) {
      this.publicServantContext =
        this.sharedContext && this.sharedContext.isPublicServant
          ? this.publicServantContext
          : await getPublicServantContext({
              ...this.config,
              organizationId: await this.getSelectedOrganization(),
            });
    }
    return this.publicServantContext as PartialAuthSessionContext;
  }

  private ensureIsFullContext(
    context: PartialAuthSessionContext,
  ): AuthSessionContext {
    if (!context.user) {
      getCommonLogger().error({
        error: createError.Unauthorized("Missing user"),
      });
      throw notFound();
    }

    return context as AuthSessionContext;
  }

  async isPublicServant(): Promise<boolean> {
    return (await this.getPartialContext()).isPublicServant;
  }

  async isInactivePublicServant(): Promise<boolean> {
    return (await this.getPartialContext()).isInactivePublicServant;
  }

  async getUser(): Promise<AuthSessionUserInfo> {
    return (await this.getContext()).user;
  }

  async isPublicServantAuthenticated(): Promise<boolean> {
    return isPublicServantAuthenticated(this.config);
  }

  async isCitizenAuthenticated(): Promise<boolean> {
    return isPublicServantAuthenticated(this.config);
  }

  async isAuthenticated(): Promise<boolean> {
    return isAuthenticated(this.config);
  }

  async getOrganizations(): Promise<Record<string, OrganizationData>> {
    return (await this.getCitizen()).user?.organizationData ?? {};
  }

  async getSelectedOrganization(): Promise<string> {
    const storedOrgId = getSelectedOrganization();
    getCommonLogger().info({ storedOrgId });
    if (storedOrgId) {
      const context = await this.getCitizen();
      getCommonLogger().info({ citizenContext: context });
      const userOrganizations = Object.keys(
        context.user?.organizationData ?? {},
      );
      if (userOrganizations?.includes(storedOrgId)) {
        return storedOrgId;
      }
    }

    const orgs = await this.getOrganizations();
    getCommonLogger().info({ gotOrganizations: orgs });
    return Object.values(orgs)?.[0]?.id;
  }

  setSelectedOrganization(organizationId: string): string {
    setSelectedOrganization(organizationId);
    return organizationId;
  }

  private getPartialContext = (): Promise<PartialAuthSessionContext> => {
    if (!this.citizenContext && !this.publicServantContext) {
      return this.getCitizen();
    }

    if (this.citizenContext) {
      return this.getCitizen();
    }

    return this.getPublicServant();
  };

  async getToken() {
    try {
      getCommonLogger().info({
        get_token_config: this.config,
      });
      let response: string | null = null;
      const isPublicServant = await this.isPublicServant();
      getCommonLogger().info({ isPublicServant });
      if (isPublicServant) {
        response = await getOrgToken(
          this.config,
          await this.getSelectedOrganization(),
        );
        getCommonLogger().info({ getOrgTokenResponse: response });
        return response;
      }
      response = await getCitizenToken(this.config, this.config.resourceUrl);
      getCommonLogger().info({ getCitizenTokenResponse: response });
      return response;
    } catch (e) {
      getCommonLogger().error(e, "Error in base auth context");
      throw e;
    }
  }
}
