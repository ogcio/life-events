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

        req.headers.set("x-session-id", authToken);

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

  async getProviderById(
    providerId: paths["/api/v1/providers/{providerId}"]["get"]["parameters"]["path"]["providerId"],
  ) {
    return formatQueryResult(
      this.client.GET("/api/v1/providers/{providerId}", {
        params: {
          path: {
            providerId,
          },
        },
      }),
    );
  }

  async createProvider(
    data: paths["/api/v1/providers/"]["post"]["requestBody"]["content"]["application/json"],
  ) {
    return formatQueryResult(
      this.client.POST("/api/v1/providers/", {
        body: data,
      }),
    );
  }

  async updateProvider(
    providerId: paths["/api/v1/providers/{providerId}"]["put"]["parameters"]["path"]["providerId"],
    data: paths["/api/v1/providers/{providerId}"]["put"]["requestBody"]["content"]["application/json"],
  ) {
    return formatQueryResult(
      this.client.PUT("/api/v1/providers/{providerId}", {
        params: {
          path: {
            providerId,
          },
        },
        body: data,
      }),
    );
  }

  /**
   * PAYMENT REQUESTS
   */

  async getPaymentRequests() {
    return formatQueryResult(this.client.GET("/api/v1/requests/"));
  }

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

  async getPaymentRequestTransactions(
    requestId: paths["/api/v1/requests/{requestId}/transactions"]["get"]["parameters"]["path"]["requestId"],
  ) {
    return formatQueryResult(
      this.client.GET("/api/v1/requests/{requestId}/transactions", {
        params: {
          path: {
            requestId,
          },
        },
      }),
    );
  }

  async createPaymentRequest(
    data: paths["/api/v1/requests/"]["post"]["requestBody"]["content"]["application/json"],
  ) {
    return formatQueryResult(
      this.client.POST("/api/v1/requests/", {
        body: data,
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

  async updatePaymentRequest(
    data: paths["/api/v1/requests/"]["put"]["requestBody"]["content"]["application/json"],
  ) {
    return formatQueryResult(
      this.client.PUT("/api/v1/requests/", {
        body: data,
      }),
    );
  }

  async deletePaymentRequest(
    requestId: paths["/api/v1/requests/{requestId}"]["delete"]["parameters"]["path"]["requestId"],
  ) {
    return formatQueryResult(
      this.client.DELETE("/api/v1/requests/{requestId}", {
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

  async getTransactions() {
    return formatQueryResult(this.client.GET("/api/v1/transactions/"));
  }

  async getTransactionDetails(transactionId: string) {
    return formatQueryResult(
      this.client.GET("/api/v1/transactions/{transactionId}", {
        params: {
          path: {
            transactionId,
          },
        },
      }),
    );
  }

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

  async getRealexPaymentObject(
    query: paths["/api/v1/realex/paymentObject"]["get"]["parameters"]["query"],
  ) {
    return formatQueryResult(
      this.client.GET("/api/v1/realex/paymentObject", {
        params: {
          query,
        },
      }),
    );
  }
  /**
   * Citizen
   */

  async getCitizenTransactions() {
    return formatQueryResult(this.client.GET("/api/v1/citizen/transactions"));
  }

  async getCitizenTransactionDetails(transactionId: string) {
    return formatQueryResult(
      this.client.GET("/api/v1/citizen/transactions/{transactionId}", {
        params: {
          path: {
            transactionId,
          },
        },
      }),
    );
  }
}
