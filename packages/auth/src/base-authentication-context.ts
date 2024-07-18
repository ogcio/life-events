import {
  AuthSessionContext,
  AuthSessionUserInfo,
  PartialAuthSessionContext,
} from "./types";
import {
  getCitizenContext,
  getPublicServantContext,
} from "./authentication-context";
import { AuthenticationError, BadRequestError } from "shared-errors";
import { notFound } from "next/navigation";
import { getCommonLogger } from "nextjs-logging-wrapper";

const ERROR_PROCESS = "AUTHENTICATION_CONTEXT";

export interface AuthenticationContextConfig {
  resourceUrl: string;
  citizenScopes: string[];
  publicServantScopes: string[];
  organizationId: string;
  loginUrl: string;
  publicServantExpectedRole: string;
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
          : await getPublicServantContext(this.config);
    }
    return this.publicServantContext as PartialAuthSessionContext;
  }

  private ensureIsFullContext(
    context: PartialAuthSessionContext,
  ): AuthSessionContext {
    if (!context.accessToken) {
      getCommonLogger().error({
        error: new AuthenticationError(ERROR_PROCESS, "Missing access token"),
      });
      throw notFound();
    }
    if (!context.user) {
      getCommonLogger().error({
        error: new AuthenticationError(ERROR_PROCESS, "Missing user"),
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

  async getAccessToken(): Promise<string> {
    return (await this.getContext()).accessToken;
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
}
