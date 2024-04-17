import createClient, { FetchResponse, type Middleware } from "openapi-fetch";
import type { paths } from "./schema";

const formatQueryResult = async <T, O>(
  promise: Promise<FetchResponse<T, O>>,
) => {
  try {
    const result = await promise;
    return { data: result.data, error: null };
  } catch (error) {
    return { data: undefined, error };
  }
};

export class Messages {
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
    lang: paths["/api/v1/templates/{templateId}"]["get"]["parameters"]["query"]["lang"],
  ) {
    const { data, error } = await this.client.GET(
      "/api/v1/templates/{templateId}",
      {
        params: {
          path: { templateId },
          query: { lang },
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
}
