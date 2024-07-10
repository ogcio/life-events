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
import { getCommonLogger } from "nextjs-logging-wrapper/common-logger";

const ERROR_PROCESS = "AUTHENTICATION_CONTEXT";

export interface AuthenticationContextConfig {
  resourceUrl: URL;
  citizenScopes: string[];
  publicServantScopes: string[];
  organizationId: string;
  loginUrl: string;
  publicServantExpectedRole: string;
  baseUrl: string;
  appId: string;
  appSecret: string;
}

export class AuthenticationContextFactory {
  private static sharedContext: AuthSessionContext | null = null;
  private static citizenContext: PartialAuthSessionContext | null = null;
  private static publicServantContext: PartialAuthSessionContext | null = null;
  private static config: AuthenticationContextConfig | null = null;

  static setConfig(config: AuthenticationContextConfig) {
    this.config = config;
  }

  static async getContext() {
    if (!this.sharedContext) {
      let context = await this.getCitizen();
      if (context.isPublicServant) {
        context = await this.getPublicServant();
      }

      this.sharedContext = this.ensureIsFullContext(context);
    }

    return this.sharedContext;
  }

  static async getCitizen() {
    if (!this.citizenContext) {
      this.citizenContext =
        this.sharedContext && !this.sharedContext.isPublicServant
          ? this.sharedContext
          : await getCitizenContext(this.getConfig());
    }

    return this.citizenContext as PartialAuthSessionContext;
  }

  static async getPublicServant() {
    if (!this.publicServantContext) {
      this.publicServantContext =
        this.sharedContext && this.sharedContext.isPublicServant
          ? this.publicServantContext
          : await getPublicServantContext(this.getConfig());
    }

    return this.publicServantContext as PartialAuthSessionContext;
  }

  static async isPublicServant(): Promise<boolean> {
    return (await this.getPartialContext()).isPublicServant;
  }

  static async getUser(): Promise<AuthSessionUserInfo> {
    return (await this.getContext()).user;
  }

  static async getAccessToken(): Promise<string> {
    return (await this.getContext()).accessToken;
  }

  private static getConfig() {
    if (!this.config) {
      throw new BadRequestError(ERROR_PROCESS, "You have to set config before");
    }

    return this.config;
  }

  private static ensureIsFullContext(
    context: PartialAuthSessionContext,
  ): AuthSessionContext {
    getCommonLogger().fatal({ context });
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

  private static getPartialContext = (): Promise<PartialAuthSessionContext> => {
    if (!this.citizenContext && !this.publicServantContext) {
      return this.getCitizen();
    }

    if (this.citizenContext) {
      return this.getCitizen();
    }

    return this.getPublicServant();
  };
}
