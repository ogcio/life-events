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

  /**
   * PROVIDERS
   */
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

  /**
   * PAYMENT REQUESTS
   */

  async getPaymentRequest(
    requestId: paths["/api/v1/requests/{requestId}"]["get"]["parameters"]["path"]["requestId"],
  ) {
    return formatQueryResult(
      this.client.GET("/api/v1/requests/{requestId}", {
        params: {
          path: {
            requestId,
          },
        },
      }),
    );
  }

  async getPaymentRequestPublicInfo(
    requestId: paths["/api/v1/requests/{requestId}/public-info"]["get"]["parameters"]["path"]["requestId"],
  ) {
    return formatQueryResult(
      this.client.GET("/api/v1/requests/{requestId}/public-info", {
        params: {
          path: {
            requestId,
          },
        },
      }),
    );
  }

  /**
   * TRANSACTIONS
   */

  async updateTransaction(
    transactionId: paths["/api/v1/transactions/{transactionId}"]["patch"]["parameters"]["path"]["transactionId"],
    data: paths["/api/v1/transactions/{transactionId}"]["patch"]["requestBody"]["content"]["application/json"],
  ) {
    return formatQueryResult(
      this.client.PATCH("/api/v1/transactions/{transactionId}", {
        params: {
          path: {
            transactionId,
          },
        },
        body: data,
      }),
    );
  }

  async createTransaction(
    data: paths["/api/v1/transactions/"]["post"]["requestBody"]["content"]["application/json"],
  ) {
    return formatQueryResult(
      this.client.POST("/api/v1/transactions/", {
        body: data,
      }),
    );
  }

  async generatePaymentIntentId() {
    return formatQueryResult(
      this.client.GET("/api/v1/transactions/generatePaymentIntentId"),
    );
  }
}
