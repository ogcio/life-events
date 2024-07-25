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

  async getEmailProviders() {
    const { error, data } = await this.client.GET("/api/v1/providers/emails/");

    return { error, data: data?.data };
  }

  async getEmailProvider(
    providerId: paths["/api/v1/providers/emails/{providerId}"]["get"]["parameters"]["path"]["providerId"],
  ) {
    const { data, error } = await this.client.GET(
      "/api/v1/providers/emails/{providerId}",
      {
        params: { path: { providerId } },
      },
    );

    return { error, data: data?.data };
  }

  async createEmailProvider(
    body: paths["/api/v1/providers/emails/"]["post"]["requestBody"]["content"]["application/json"],
  ) {
    const { data, error } = await this.client.POST(
      "/api/v1/providers/emails/",
      { body },
    );

    return { error, data: data?.data };
  }

  async updateEmailProvider(
    providerId: paths["/api/v1/providers/emails/{providerId}"]["put"]["parameters"]["path"]["providerId"],
    body: paths["/api/v1/providers/emails/{providerId}"]["put"]["requestBody"]["content"]["application/json"],
  ) {
    const { error } = await this.client.PUT(
      "/api/v1/providers/emails/{providerId}",
      {
        params: { path: { providerId } },
        body,
      },
    );

    return { error };
  }

  async deleteEmailProvider(
    providerId: paths["/api/v1/providers/emails/{providerId}"]["delete"]["parameters"]["path"]["providerId"],
  ) {
    const { error } = await this.client.DELETE(
      "/api/v1/providers/emails/{providerId}",
      {
        params: { path: { providerId } },
      },
    );

    return { error };
  }

  async getSmsProviders() {
    const { error, data } = await this.client.GET("/api/v1/providers/sms/");
    return { error, data: data?.data };
  }

  async getSmsProvider(
    providerId: paths["/api/v1/providers/sms/{providerId}"]["get"]["parameters"]["path"]["providerId"],
  ) {
    const { error, data } = await this.client.GET(
      "/api/v1/providers/sms/{providerId}",
      {
        params: {
          path: { providerId },
        },
      },
    );

    return { error, data: data?.data };
  }

  async updateSmsProvider(
    providerId: paths["/api/v1/providers/sms/{providerId}"]["put"]["parameters"]["path"]["providerId"],
    body: paths["/api/v1/providers/sms/{providerId}"]["put"]["requestBody"]["content"]["application/json"],
  ) {
    const { error } = await this.client.PUT(
      "/api/v1/providers/sms/{providerId}",
      { params: { path: { providerId } }, body },
    );

    return { error };
  }

  async createSmsProvider(
    body: paths["/api/v1/providers/sms/"]["post"]["requestBody"]["content"]["application/json"],
  ) {
    const { error } = await this.client.POST("/api/v1/providers/sms/", {
      body,
    });

    return { error };
  }

  async deleteSmsProvider(
    providerId: paths["/api/v1/providers/sms/{providerId}"]["delete"]["parameters"]["path"]["providerId"],
  ) {
    const { error } = await this.client.DELETE(
      "/api/v1/providers/sms/{providerId}",
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

  async getOrganisationsSettings() {
    const { error, data } = await this.client.GET(
      "/api/v1/organisation-settings/",
    );
    return { error, data: data?.data };
  }

  async getOrganisationSettings(organisationId: string) {
    const { error, data } = await this.client.GET(
      "/api/v1/organisation-settings/{organisationId}",
      {
        params: { path: { organisationId } },
      },
    );
    return { error, data: data?.data };
  }

  async updateOrganisationSettings(
    organisationId: string,
    body: paths["/api/v1/organisation-settings/{organisationId}"]["patch"]["requestBody"]["content"]["application/json"],
  ) {
    const { error, data } = await this.client.PATCH(
      "/api/v1/organisation-settings/{organisationId}",
      {
        body,
        params: { path: { organisationId } },
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
