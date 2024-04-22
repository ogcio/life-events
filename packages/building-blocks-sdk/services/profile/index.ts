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

export class Profile {
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
      baseUrl: process.env.PROFILE_BACKEND_URL,
    });
    this.client.use(authMiddleware);
  }

  async getAddresses() {
    return formatQueryResult(this.client.GET("/api/v1/addresses/"));
  }

  async getAddress(addressId: string) {
    return formatQueryResult(
      this.client.GET("/api/v1/addresses/{addressId}", {
        params: { path: { addressId } },
      }),
    );
  }

  async createAddress(
    data: paths["/api/v1/addresses/"]["post"]["requestBody"]["content"]["application/json"],
  ) {
    return formatQueryResult(
      this.client.POST("/api/v1/addresses/", {
        body: data,
      }),
    );
  }

  async updateAddress(
    addressId: string,
    data: paths["/api/v1/addresses/"]["post"]["requestBody"]["content"]["application/json"],
  ) {
    return formatQueryResult(
      this.client.PUT("/api/v1/addresses/{addressId}", {
        params: { path: { addressId } },
        body: data,
      }),
    );
  }

  async deleteAddress(addressId: string) {
    return formatQueryResult(
      this.client.DELETE("/api/v1/addresses/{addressId}", {
        params: { path: { addressId } },
      }),
    );
  }
}
