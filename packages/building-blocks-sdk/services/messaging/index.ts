import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./schema";

function newInterpolator(interpolations: Record<string, string>) {
  return function replacer(acc: string, key: string) {
    return acc.replaceAll(`{{${key}}}`, interpolations[key]);
  };
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

  async getMessages(type?: string) {
    const params: Record<string, object> = {};

    if (type) {
      params.query = { type };
    }
    const { error, data } = await this.client.GET("/api/v1/messages/", {
      params,
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

  async getTemplates(lang?: string) {
    const { error, data } = await this.client.GET("/api/v1/templates/", {
      params: { query: { lang } },
    });

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
      messageName: message.messageName,
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
    search?: string;
    primary?: boolean;
  }) {
    const { limit, offset, search, primary } = params || {};
    const { error, data } = await this.client.GET("/api/v1/providers/", {
      params: {
        query: {
          type: "email",
          limit,
          offset,
          search,
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
    search?: string;
    primary?: boolean;
  }) {
    const { limit, offset, search, primary } = params || {};
    const { error, data } = await this.client.GET("/api/v1/providers/", {
      params: {
        query: {
          type: "sms",
          limit,
          offset,
          search,
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
      const { error } = await this.client.POST("/api/v1/users/imports/", {
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

    const { error } = await this.client.POST("/api/v1/users/imports/", {
      body: toImport.records,
    });
    return { error };
  }

  async downloadUsersCsvTemplate() {
    const { data } = await this.client.GET(
      "/api/v1/users/imports/csv/template",
      {
        parseAs: "blob",
      },
    );
    return data;
  }

  async getUsersImports(organisationId?: string) {
    const { error, data } = await this.client.GET("/api/v1/users/imports/", {
      params: {
        query: { organisationId },
      },
    });
    return { error, data: data?.data };
  }

  async getUsersImport(
    importId: string,
    organisationId?: string,
    includeUsersData?: boolean,
  ) {
    const { error, data } = await this.client.GET(
      "/api/v1/users/imports/{importId}",
      {
        params: {
          path: { importId },
          query: {
            organisationId,
            includeUsersData: Boolean(includeUsersData),
          },
        },
      },
    );
    return { error, data: data?.data };
  }

  async getUsersForImport(importId: string, organisationId?: string) {
    const { error, data } = await this.client.GET(
      "/api/v1/users/imports/{importId}/users",
      {
        params: { path: { importId }, query: { organisationId } },
      },
    );
    return { error, data: data?.data };
  }

  async getUsers(organisationId?: string) {
    const { error, data } = await this.client.GET(
      "/api/v1/users/imports/users",
      {
        params: { query: { organisationId } },
      },
    );
    return { error, data: data?.data };
  }

  async getOrganisationInvitations() {
    const { error, data } = await this.client.GET(
      "/api/v1/users/settings/organisations",
    );
    return { error, data: data?.data };
  }

  async getOrganisationInvitation(organisationId: string) {
    const { error, data } = await this.client.GET(
      "/api/v1/users/settings/organisations/{organisationId}",
      {
        params: { path: { organisationId } },
      },
    );
    return { error, data: data?.data };
  }

  async updateOrganisationInvitation(
    organisationId: string,
    body: paths["/api/v1/users/settings/organisations/{organisationId}"]["patch"]["requestBody"]["content"]["application/json"],
  ) {
    const { error, data } = await this.client.PATCH(
      "/api/v1/users/settings/organisations/{organisationId}",
      {
        body,
        params: { path: { organisationId } },
      },
    );

    return { error, data: data?.data };
  }

  async getInvitation() {
    const { error, data } = await this.client.GET(
      "/api/v1/users/settings/invitations/me",
    );
    return { error, data: data?.data };
  }

  async updateInvitation(
    body: paths["/api/v1/users/settings/invitations/me"]["patch"]["requestBody"]["content"]["application/json"],
  ) {
    const { error, data } = await this.client.PATCH(
      "/api/v1/users/settings/invitations/me",
      {
        body,
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

  async getRecipients(
    query: paths["/api/v1/users/recipients/"]["get"]["parameters"]["query"],
  ) {
    const { error, data } = await this.client.GET("/api/v1/users/recipients/", {
      params: {
        query,
      },
    });
    return { error, data: data?.data, metadata: data?.metadata };
  }

  async getRecipient(
    userId: paths["/api/v1/users/recipients/{userId}"]["get"]["parameters"]["path"]["userId"],
  ) {
    const { error, data } = await this.client.GET(
      "/api/v1/users/recipients/{userId}",
      {
        params: {
          path: {
            userId,
          },
        },
      },
    );

    return { error, data: data?.data, metadata: data?.metadata };
  }
}
