import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./schema.js";

function newInterpolator(interpolations: Record<string, string>) {
  return function replacer(acc: string, key: string) {
    return acc.replaceAll(`{{${key}}}`, interpolations[key]);
  };
}

function toStringOrUndefined(variable: number | boolean | undefined) {
  return variable === undefined ? undefined : String(variable);
}

export class Messaging {
  private client: ReturnType<typeof createClient<paths>>;
  constructor(authToken: string) {
    const authMiddleware: Middleware = {
      async onRequest(req) {
        req.headers.set("Authorization", `Bearer ${authToken}`);
        return req;
      },
    };

    this.client = createClient<paths>({
      baseUrl: process.env.MESSAGES_BACKEND_URL,
    });
    this.client.use(authMiddleware);
  }

  async getMessagesForUser(
    userId: string,
    filter?: { offset?: number; limit?: number },
  ) {
    const { error, data } = await this.client.GET("/api/v1/messages/", {
      params: {
        query: {
          limit: toStringOrUndefined(filter?.limit),
          offset: toStringOrUndefined(filter?.offset),
          recipientUserId: userId,
          status: "delivered",
        },
      },
    });

    return { error, data: data?.data };
  }

  async getMessagesForOrganisation(
    organisationId: string,
    filter?: { offset?: number; limit?: number },
  ) {
    const { error, data } = await this.client.GET("/api/v1/messages/", {
      params: {
        query: {
          limit: toStringOrUndefined(filter?.limit),
          offset: toStringOrUndefined(filter?.offset),
          organisationId,
        },
      },
    });

    return { error, data: data?.data };
  }

  async getMessage(
    messageId: paths["/api/v1/messages/{messageId}"]["get"]["parameters"]["path"]["messageId"],
  ) {
    const { data, error } = await this.client.GET(
      "/api/v1/messages/{messageId}",
      {
        params: { path: { messageId } },
      },
    );

    return { error, data: data?.data };
  }

  async send(
    body: paths["/api/v1/messages/"]["post"]["requestBody"]["content"]["application/json"],
  ) {
    const { error, data } = await this.client.POST("/api/v1/messages/", {
      body,
    });

    return { error, data: data?.data };
  }

  async getTemplates() {
    const { error, data } = await this.client.GET("/api/v1/templates/");

    return { error, data: data?.data };
  }

  async getTemplate(
    templateId: paths["/api/v1/templates/{templateId}"]["get"]["parameters"]["path"]["templateId"],
  ) {
    const { data, error } = await this.client.GET(
      "/api/v1/templates/{templateId}",
      {
        params: {
          path: {
            templateId,
          },
        },
      },
    );
    return { data: data?.data, error };
  }

  async buildMessage(
    messages: paths["/api/v1/messages/"]["post"]["requestBody"]["content"]["application/json"]["message"][],
    lang: string,
    vars: Record<string, string | null | undefined>,
  ) {
    if (!lang) {
      throw new Error("no language provided");
    }

    const message = messages.find((m) => m.lang === lang);

    if (!message) {
      throw new Error(`template not found for language ${lang}`);
    }

    const illegalValueKeys: string[] = [];
    const keys = Object.keys(vars);
    for (const key of keys) {
      if (vars[key] === null || vars[key] === undefined) {
        illegalValueKeys.push(key);
      }
    }

    if (illegalValueKeys.length) {
      throw new Error(`illegal empty variables ${illegalValueKeys.join(", ")}`);
    }

    // No null | undefined at this point
    const interpolator = newInterpolator(vars as Record<string, string>);

    const textVariables = new Set<string>();
    for (const text of [
      message.subject,
      message.excerpt,
      message.richText,
      message.plainText,
    ]) {
      (text.match(/[^{{]+(?=}})/g) || []).forEach(
        textVariables.add,
        textVariables,
      );
    }

    // Check all content if there's any unhandled vars.
    const illegalVariables: string[] = [];
    textVariables.forEach((val) => {
      if (!keys.some((key) => key === val)) {
        illegalVariables.push(val);
      }
    });

    if (illegalVariables.length) {
      throw new Error(
        `illegal template variables ${illegalVariables.join(", ")}`,
      );
    }

    return {
      threadName: message.threadName,
      subject: keys.reduce(interpolator, message.subject),
      excerpt: keys.reduce(interpolator, message.excerpt),
      richText: keys.reduce(interpolator, message.richText),
      plainText: keys.reduce(interpolator, message.plainText),
      lang: message.lang,
    };
  }

  async createTemplate(
    body: paths["/api/v1/templates/"]["post"]["requestBody"]["content"]["application/json"],
  ) {
    return this.client.POST("/api/v1/templates/", { body });
  }

  async updateTemplate(
    templateId: paths["/api/v1/templates/{templateId}"]["put"]["parameters"]["path"]["templateId"],
    body: paths["/api/v1/templates/{templateId}"]["put"]["requestBody"]["content"]["application/json"],
  ) {
    const { error } = await this.client.PUT("/api/v1/templates/{templateId}", {
      params: { path: { templateId } },
      body,
    });
    return { error };
  }

  async deleteTemplate(
    templateId: paths["/api/v1/templates/{templateId}"]["delete"]["parameters"]["path"]["templateId"],
  ) {
    const { error } = await this.client.DELETE(
      "/api/v1/templates/{templateId}",
      {
        params: { path: { templateId } },
      },
    );
    return { error };
  }

  async getEmailProviders(params?: {
    limit?: number;
    offset?: number;
    primary?: boolean;
  }) {
    const { limit, offset, primary } = params || {};
    const { error, data } = await this.client.GET("/api/v1/providers/", {
      params: {
        query: {
          type: "email",
          limit: toStringOrUndefined(limit),
          offset: toStringOrUndefined(offset),
          primary,
        },
      },
    });

    return {
      error,
      data: data?.data
        .filter((item) => item.type === "email")
        .map((item) => ({
          id: item.id,
          providerName: item.providerName,
          isPrimary: item.isPrimary,
        })),
    };
  }

  async getEmailProvider(providerId: string) {
    const { data, error } = await this.client.GET(
      "/api/v1/providers/{providerId}",
      {
        params: { path: { providerId }, query: { type: "email" } },
      },
    );

    console.log(data?.data);

    if (data?.data.type === "email") {
      return { data: data.data };
    }

    return { error };
  }

  async createEmailProvider(provider: {
    providerName: string;
    isPrimary: boolean;
    smtpHost: string;
    smtpPort: number;
    username: string;
    password: string;
    throttle?: number;
    fromAddress: string;
    ssl: boolean;
  }) {
    const { data, error } = await this.client.POST("/api/v1/providers/", {
      body: {
        type: "email",
        ...provider,
      },
    });

    return { error, data: data?.data };
  }

  async updateEmailProvider(provider: {
    id: string;
    providerName: string;
    isPrimary: boolean;
    smtpHost: string;
    smtpPort: number;
    username: string;
    password: string;
    throttle?: number;
    fromAddress: string;
    ssl: boolean;
  }) {
    const { error } = await this.client.PUT("/api/v1/providers/{providerId}", {
      params: { path: { providerId: provider.id } },
      body: {
        type: "email",
        ...provider,
      },
    });
    return { error };
  }

  async deleteEmailProvider(providerId: string) {
    const { error } = await this.client.DELETE(
      "/api/v1/providers/{providerId}",
      {
        params: { path: { providerId } },
      },
    );

    return { error };
  }

  async getSmsProviders(params?: {
    limit?: number;
    offset?: number;
    primary?: boolean;
  }) {
    const { limit, offset, primary } = params || {};
    const { error, data } = await this.client.GET("/api/v1/providers/", {
      params: {
        query: {
          type: "sms",
          limit: toStringOrUndefined(limit),
          offset: toStringOrUndefined(offset),
          primary,
        },
      },
    });

    return {
      error,
      data: data?.data
        .filter((item) => item.type === "sms")
        .map((item) => ({
          id: item.id,
          providerName: item.providerName,
          isPrimary: item.isPrimary,
        })),
    };
  }

  async getSmsProvider(providerId: string) {
    const { data, error } = await this.client.GET(
      "/api/v1/providers/{providerId}",
      {
        params: { path: { providerId }, query: { type: "sms" } },
      },
    );

    // Let's do some type plumbing for the implementor
    if (data?.data.type === "sms") {
      return { data: data.data };
    }

    // Can we throw or return a new NotFoundError here?
    return { error };
  }

  async updateSmsProvider(provider: {
    id: string;
    providerName: string;
    isPrimary: boolean;
    // Union other config types
    config: {
      type: "AWS";
      accessKey: string;
      secretAccessKey: string;
      region: string;
    };
  }) {
    const { error } = await this.client.PUT("/api/v1/providers/{providerId}", {
      params: { path: { providerId: provider.id } },
      body: {
        type: "sms",
        ...provider,
      },
    });
    return { error };
  }

  async createSmsProvider(provider: {
    providerName: string;
    isPrimary: boolean;
    // Union other config types
    config: {
      type: "AWS";
      accessKey: string;
      secretAccessKey: string;
      region: string;
    };
  }) {
    const { error, data } = await this.client.POST("/api/v1/providers/", {
      body: {
        type: "sms",
        ...provider,
      },
    });

    return { error, data: data?.data };
  }

  async deleteSmsProvider(providerId: string) {
    const { error } = await this.client.DELETE(
      "/api/v1/providers/{providerId}",
      { params: { path: { providerId } } },
    );

    return { error };
  }

  async importUsers(toImport: { file?: File; records?: object[] }) {
    if (toImport.file) {
      const { error } = await this.client.POST("/api/v1/user-imports/", {
        body: {
          file: toImport.file,
        } as any,
        bodySerializer: (body: any) => {
          const formData = new FormData();
          formData.set("file", body.file);
          return formData;
        },
      });
      return { error };
    }

    const { error } = await this.client.POST("/api/v1/user-imports/", {
      body: toImport.records,
    });
    return { error };
  }

  async downloadUsersCsvTemplate() {
    const { data } = await this.client.GET(
      "/api/v1/user-imports/template-download",
      {
        parseAs: "blob",
      },
    );
    return data;
  }

  async getUsersImports() {
    const { error, data } = await this.client.GET("/api/v1/user-imports/");
    return { error, data: data?.data };
  }

  async getUsersImport(
    importId: string,
    includeUsersData?: "true" | "false" | "0" | "1",
  ) {
    const { error, data } = await this.client.GET(
      "/api/v1/user-imports/{importId}",
      {
        params: {
          path: { importId },
          query: {
            includeImportedData: includeUsersData,
          },
        },
      },
    );
    return { error, data: data?.data };
  }

  async getUsersForImport(importId: string, activeOnly: boolean) {
    const { error, data } = await this.client.GET("/api/v1/users/", {
      params: { query: { importId, activeOnly: String(activeOnly) } },
    });
    return { error, data: data?.data };
  }

  async getOrganisationsSettings() {
    const { error, data } = await this.client.GET(
      "/api/v1/organisation-settings/",
    );
    return { error, data: data?.data };
  }

  async getOrganisationSettings(organisationSettingId: string) {
    const { error, data } = await this.client.GET(
      "/api/v1/organisation-settings/{organisationSettingId}",
      {
        params: { path: { organisationSettingId } },
      },
    );
    return { error, data: data?.data };
  }

  async updateOrganisationSettings(
    organisationSettingId: string,
    body: paths["/api/v1/organisation-settings/{organisationSettingId}"]["patch"]["requestBody"]["content"]["application/json"],
  ) {
    const { error, data } = await this.client.PATCH(
      "/api/v1/organisation-settings/{organisationSettingId}",
      {
        body,
        params: { path: { organisationSettingId } },
      },
    );

    return { error, data: data?.data };
  }

  async getMessageEvents(
    params: paths["/api/v1/message-events/"]["get"]["parameters"]["query"],
  ) {
    const { data, error } = await this.client.GET("/api/v1/message-events/", {
      params: { query: params },
    });

    return { data: data?.data, error, metadata: data?.metadata };
  }

  async getMessageEvent(eventId: string) {
    const { error, data } = await this.client.GET(
      "/api/v1/message-events/{eventId}",
      { params: { path: { eventId } } },
    );

    console.log(data?.data);
    return { data: data?.data, error };
  }

  async getUsers(
    query?: paths["/api/v1/users/"]["get"]["parameters"]["query"],
  ) {
    const { error, data } = await this.client.GET("/api/v1/users/", {
      params: {
        query,
      },
    });
    return { error, data: data?.data, metadata: data?.metadata };
  }

  async getUser(
    userId: paths["/api/v1/users/{userId}"]["get"]["parameters"]["path"]["userId"],
    activeOnly: boolean,
  ) {
    const { error, data } = await this.client.GET("/api/v1/users/{userId}", {
      params: {
        path: {
          userId,
        },
        query: {
          activeOnly: toStringOrUndefined(activeOnly),
        },
      },
    });

    return { error, data: data?.data, metadata: data?.metadata };
  }
}
