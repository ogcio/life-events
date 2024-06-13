import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./schema";

export class Messaging {
  private client: ReturnType<typeof createClient<paths>>;
  constructor(authToken: string) {
    const authMiddleware: Middleware = {
      async onRequest(req) {
        // Send temporarly the user id as auth token
        req.headers.set("x-user-id", authToken);

        // Once the logto integration is complete, we will send the real auth token
        //req.headers.set("Authorization", `Bearer ${authToken}`);
        return req;
      },
    };

    this.client = createClient<paths>({
      baseUrl: process.env.MESSAGES_BACKEND_URL,
    });
    this.client.use(authMiddleware);
  }

  async getMessages(type?: string) {
    const { error, data } = await this.client.GET("/api/v1/messages/", {
      params: {
        query: { type },
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

  async createMessage(
    body: paths["/api/v1/messages/"]["post"]["requestBody"]["content"]["application/json"],
  ) {
    const { error } = await this.client.POST("/api/v1/messages/", {
      body,
    });

    return { error };
  }

  async getTemplates(lang?: string) {
    const { error, data } = await this.client.GET("/api/v1/templates/", {
      params: { query: { lang: lang ?? "en" } },
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

  async importUsersCsv(file: File) {
    const { error } = await this.client.POST("/api/v1/users/imports/csv", {
      body: {
        file,
      } as any,
      bodySerializer: (body: any) => {
        const formData = new FormData();
        formData.set("file", body.file);
        return formData;
      },
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
          query: { organisationId, includeUsersData },
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

  async getMockOrganisationId() {
    const { error, data } = await this.client.GET(
      "/api/v1/users/imports/mock-organisation-id",
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
}
