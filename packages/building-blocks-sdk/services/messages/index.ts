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

  async getMessages() {
    return this.client.GET("/api/v1/messages/");
  }

  async getMessage(
    messageId: paths["/api/v1/messages/{messageId}"]["get"]["parameters"]["path"]["messageId"],
  ) {
    return this.client.GET("/api/v1/messages/{messageId}", {
      params: { path: { messageId } },
    });
  }

  async createMessage(
    data: paths["/api/v1/messages/"]["post"]["requestBody"]["content"]["application/json"],
  ) {
    return formatQueryResult(
      this.client.POST("/api/v1/messages/", {
        body: data,
      }),
    );
  }

  async getTemplates(
    lang?: paths["/api/v1/templates/"]["get"]["parameters"]["query"]["lang"],
  ) {
    return this.client.GET("/api/v1/templates/", {
      params: { query: { lang: lang ?? "en" } },
    });
  }

  async getTemplate(
    params: paths["/api/v1/templates/{templateId}"]["get"]["parameters"],
  ) {
    return this.client.GET("/api/v1/templates/{templateId}", { params });
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
    return this.client.PUT("/api/v1/templates/{templateId}", {
      params: { path: { templateId } },
      body,
    });
  }

  async deleteTemplate(
    templateId: paths["/api/v1/templates/{templateId}"]["delete"]["parameters"]["path"]["templateId"],
  ) {
    return this.client.DELETE("/api/v1/templates/{templateId}", {
      params: { path: { templateId } },
    });
  }

  async getEmailProviders() {
    return this.client.GET("/api/v1/providers/emails/");
  }

  async getEmailProvider(
    providerId: paths["/api/v1/providers/emails/{providerId}"]["get"]["parameters"]["path"]["providerId"],
  ) {
    return this.client.GET("/api/v1/providers/emails/{providerId}", {
      params: { path: { providerId } },
    });
  }

  async createEmailProvider(
    body: paths["/api/v1/providers/emails/"]["post"]["requestBody"]["content"]["application/json"],
  ) {
    return this.client.POST("/api/v1/providers/emails/", { body });
  }

  async updateEmailProvider(
    providerId: paths["/api/v1/providers/emails/{providerId}"]["put"]["parameters"]["path"]["providerId"],
    body: paths["/api/v1/providers/emails/{providerId}"]["put"]["requestBody"]["content"]["application/json"],
  ) {
    return this.client.PUT("/api/v1/providers/emails/{providerId}", {
      params: { path: { providerId } },
      body,
    });
  }

  async deleteEmailProvider(
    providerId: paths["/api/v1/providers/emails/{providerId}"]["delete"]["parameters"]["path"]["providerId"],
  ) {
    return this.client.DELETE("/api/v1/providers/emails/{providerId}", {
      params: { path: { providerId } },
    });
  }
}
