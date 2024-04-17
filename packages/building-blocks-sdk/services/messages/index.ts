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

  // async createMessage(data: paths["/api/v1/messages/"]["post"]) {
  //   return formatQueryResult(
  //     this.client.POST("/api/v1/messages/", {
  //       body: data,
  //     }),
  //   );
  // }
}
