import createClient, { FetchResponse, type Middleware } from "openapi-fetch";
import type { paths } from "./schema";

const formatQueryResult = async <T, O>(
  promise: Promise<FetchResponse<T, O, "application/json">>,
) => {
  try {
    const result = await promise;
    return { data: result.data, error: result.error };
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

  async patchAddress(
    addressId: string,
    data: NonNullable<
      paths["/api/v1/addresses/{addressId}"]["patch"]["requestBody"]
    >["content"]["application/json"],
  ) {
    if (!data || Object.keys(data).length === 0) {
      return;
    }
    return formatQueryResult(
      this.client.PATCH("/api/v1/addresses/{addressId}", {
        params: { path: { addressId } },
        body: data,
      }),
    );
  }

  async updateAddress(
    addressId: string,
    data: paths["/api/v1/addresses/{addressId}"]["put"]["requestBody"]["content"]["application/json"],
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

  async getEntitlements() {
    return formatQueryResult(this.client.GET("/api/v1/entitlements/"));
  }

  async getUser() {
    return formatQueryResult(this.client.GET("/api/v1/user/"));
  }

  async getUserById(id: string) {
    const { data, error } = await this.client.GET("/api/v1/user/details/{id}", {
      params: { path: { id } },
    });

    return { error, data: data?.data };
  }

  async createUser(
    data: paths["/api/v1/user/"]["post"]["requestBody"]["content"]["application/json"],
  ) {
    return formatQueryResult(
      this.client.POST("/api/v1/user/", {
        body: data,
      }),
    );
  }

  async updateUser(
    data: paths["/api/v1/user/"]["put"]["requestBody"]["content"]["application/json"],
  ) {
    return formatQueryResult(
      this.client.PUT("/api/v1/user/", {
        body: data,
      }),
    );
  }

  async patchUser(
    data?: NonNullable<
      paths["/api/v1/user/"]["patch"]["requestBody"]
    >["content"]["application/json"],
  ) {
    if (!data || Object.keys(data).length === 0) {
      return;
    }

    return formatQueryResult(
      this.client.PATCH("/api/v1/user/", {
        body: data,
      }),
    );
  }

  async findUser(
    query: paths["/api/v1/user/find"]["get"]["parameters"]["query"],
  ) {
    return formatQueryResult(
      this.client.GET("/api/v1/user/find", {
        params: {
          query,
        },
      }),
    );
  }
}
