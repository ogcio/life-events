import createClient, { FetchResponse, type Middleware } from "openapi-fetch";
import type { paths } from "./schema";

const formatQueryResult = async <T, O>(
  promise: Promise<FetchResponse<T, O>>,
) => {
  try {
    const result = await promise;
    return { data: result.data, error: result.error };
  } catch (error) {
    return { data: undefined, error };
  }
};

export class Payments {
  client: ReturnType<typeof createClient<paths>>;
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
      baseUrl: process.env.PAYMENTS_BACKEND_URL,
    });
    this.client.use(authMiddleware);
  }

  async getProviders() {
    return formatQueryResult(this.client.GET("/api/v1/providers/"));
  }

  async createBankTransferProvider(
    data: paths["/api/v1/providers/banktransfer"]["post"]["requestBody"]["content"]["application/json"],
  ) {
    return formatQueryResult(
      this.client.POST("/api/v1/providers/banktransfer", {
        body: data,
      }),
    );
  }

  async createOpenBankingProvider(
    data: paths["/api/v1/providers/openbanking"]["post"]["requestBody"]["content"]["application/json"],
  ) {
    return formatQueryResult(
      this.client.POST("/api/v1/providers/openbanking", {
        body: data,
      }),
    );
  }

  async createStripeProvider(
    data: paths["/api/v1/providers/stripe"]["post"]["requestBody"]["content"]["application/json"],
  ) {
    return formatQueryResult(
      this.client.POST("/api/v1/providers/stripe", {
        body: data,
      }),
    );
  }

  async createWorldpayProvider(
    data: paths["/api/v1/providers/worldpay"]["post"]["requestBody"]["content"]["application/json"],
  ) {
    return formatQueryResult(
      this.client.POST("/api/v1/providers/worldpay", {
        body: data,
      }),
    );
  }
}
